package br.com.arquivobeyonder.ficha;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String ORIGIN = "https://appassets.androidplatform.net/";
    private static final int PICK_FILE = 1001;
    private static final int SAVE_FILE = 1002;

    private WebView web;
    private ValueCallback<Uri[]> chooser;
    private byte[] pendingExport;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();
        if (Build.VERSION.SDK_INT >= 30) {
            window.setDecorFitsSystemWindows(false);
        }

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#0c1420"));

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#0c1420"));

        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setSupportMultipleWindows(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        WebView.setWebContentsDebuggingEnabled(false);

        web.addJavascriptInterface(new NativeFiles(), "BeyonderAndroid");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                if (!"https".equals(url.getScheme()) || !HOST.equals(url.getHost())) {
                    return error(403, "Forbidden");
                }
                if (!"GET".equals(request.getMethod())) {
                    return error(405, "Forbidden");
                }
                String path = url.getPath();
                if (path == null || path.isEmpty() || "/".equals(path)) {
                    path = "/index.html";
                }
                if (path.contains("..")) {
                    return error(403, "Forbidden");
                }
                String assetPath = "www" + path;
                try {
                    InputStream stream = getAssets().open(assetPath);
                    Map<String, String> headers = new HashMap<>();
                    headers.put("Cache-Control", "no-cache");
                    headers.put("X-Content-Type-Options", "nosniff");
                    return new WebResourceResponse(mime(path), "UTF-8", 200, "OK", headers, stream);
                } catch (IOException e) {
                    return error(404, "Not Found");
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                if ("https".equals(url.getScheme()) && HOST.equals(url.getHost())) {
                    return false;
                }
                if (!request.isForMainFrame() || !request.hasGesture()) {
                    return true;
                }
                String scheme = url.getScheme();
                if ("http".equals(scheme) || "https".equals(scheme)) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, url);
                        startActivity(intent);
                    } catch (ActivityNotFoundException e) {
                        notifyUser("Não há navegador disponível para abrir este link.");
                    }
                }
                return true;
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (chooser != null) {
                    chooser.onReceiveValue(null);
                }
                chooser = filePathCallback;
                Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("*/*");
                intent.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"application/json", "text/plain"});
                try {
                    startActivityForResult(intent, PICK_FILE);
                    return true;
                } catch (ActivityNotFoundException e) {
                    chooser = null;
                    notifyUser("Seletor de arquivos indisponível.");
                    return false;
                }
            }
        });

        root.setOnApplyWindowInsetsListener((v, insets) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                Insets bars = insets.getInsets(WindowInsets.Type.systemBars());
                v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            } else {
                v.setPadding(
                    insets.getSystemWindowInsetLeft(),
                    insets.getSystemWindowInsetTop(),
                    insets.getSystemWindowInsetRight(),
                    insets.getSystemWindowInsetBottom()
                );
            }
            return insets;
        });

        root.addView(web, new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));
        setContentView(root);

        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(0, this::back);
        }

        web.loadUrl(ORIGIN + "index.html");
    }

    private void back() {
        if (web != null && web.canGoBack()) {
            web.goBack();
        } else {
            finish();
        }
    }

    @Override
    public void onBackPressed() {
        back();
    }

    @Override
    protected void onPause() {
        if (web != null) {
            web.evaluateJavascript("window.dispatchEvent(new Event('pagehide'))", null);
            web.onPause();
        }
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) {
            web.onResume();
        }
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            web.removeJavascriptInterface("BeyonderAndroid");
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }

    private WebResourceResponse error(int status, String reason) {
        return new WebResourceResponse(
            "text/plain",
            "UTF-8",
            status,
            reason,
            new HashMap<>(),
            new ByteArrayInputStream(reason.getBytes(StandardCharsets.UTF_8))
        );
    }

    private String mime(String path) {
        if (path.endsWith(".html")) return "text/html";
        if (path.endsWith(".css")) return "text/css";
        if (path.endsWith(".js")) return "application/javascript";
        if (path.endsWith(".json") || path.endsWith(".webmanifest")) return "application/json";
        if (path.endsWith(".svg")) return "image/svg+xml";
        if (path.endsWith(".png")) return "image/png";
        if (path.endsWith(".pdf")) return "application/pdf";
        return "application/octet-stream";
    }

    private void saveDocument(String title, String mimeType, byte[] data) {
        if (pendingExport != null) {
            notifyUser("Conclua ou cancele a exportação anterior.");
            return;
        }
        pendingExport = data;
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(mimeType);
        intent.putExtra(Intent.EXTRA_TITLE, title);
        try {
            startActivityForResult(intent, SAVE_FILE);
        } catch (ActivityNotFoundException e) {
            pendingExport = null;
            notifyUser("Seletor de arquivos indisponível.");
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == PICK_FILE) {
            if (chooser != null) {
                chooser.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data));
                chooser = null;
            }
            return;
        }
        if (requestCode == SAVE_FILE) {
            byte[] payload = pendingExport;
            pendingExport = null;
            if (resultCode != RESULT_OK || data == null || data.getData() == null || payload == null) {
                return;
            }
            Uri uri = data.getData();
            try (OutputStream out = getContentResolver().openOutputStream(uri)) {
                if (out == null) throw new IOException("No output stream");
                out.write(payload);
                notifyUser("Arquivo salvo no local escolhido.");
            } catch (Exception e) {
                notifyUser("Não foi possível salvar. Escolha outro local.");
            }
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    private void notifyUser(String message) {
        runOnUiThread(() -> Toast.makeText(this, message, Toast.LENGTH_LONG).show());
    }

    final class NativeFiles {
        @JavascriptInterface
        public void saveBackup(String json) {
            if (json == null || json.isEmpty()) {
                notifyUser("Backup inválido.");
                return;
            }
            byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
            if (bytes.length > 5 * 1024 * 1024) {
                notifyUser("Backup excede o limite de 5 MB.");
                return;
            }
            try {
                JSONObject obj = new JSONObject(json);
                if (!obj.has("characters")) {
                    notifyUser("Backup inválido.");
                    return;
                }
            } catch (Exception e) {
                notifyUser("Backup inválido.");
                return;
            }
            runOnUiThread(() -> saveDocument("arquivo-beyonder-backup.json", "application/json", bytes));
        }

        @JavascriptInterface
        public void saveRules() {
            try (InputStream in = getAssets().open("www/downloads/regras-essenciais.pdf");
                 ByteArrayOutputStream buffer = new ByteArrayOutputStream()) {
                byte[] chunk = new byte[8192];
                int n;
                while ((n = in.read(chunk)) != -1) {
                    buffer.write(chunk, 0, n);
                }
                byte[] bytes = buffer.toByteArray();
                runOnUiThread(() -> saveDocument("regras-essenciais.pdf", "application/pdf", bytes));
            } catch (IOException e) {
                notifyUser("PDF indisponível nesta instalação.");
            }
        }

        @JavascriptInterface
        public void printSheet() {
            runOnUiThread(() -> {
                if (web == null) return;
                PrintManager pm = (PrintManager) getSystemService(PRINT_SERVICE);
                if (pm != null) {
                    PrintDocumentAdapter adapter = web.createPrintDocumentAdapter("Ficha Beyonder");
                    pm.print("Ficha Beyonder", adapter, new PrintAttributes.Builder().build());
                }
            });
        }
    }
}
