use tauri::{WebviewUrl, WebviewWindowBuilder};
use url::Url;

const DEFAULT_WEB_URL: &str = "http://localhost:3000";

fn resolve_web_url() -> Url {
    // Load apps/desktop/.env when present (cwd may be package root or src-tauri).
    let _ = dotenvy::dotenv()
        .or_else(|_| dotenvy::from_filename(".env"))
        .or_else(|_| dotenvy::from_filename("../.env"));

    let raw = std::env::var("TAURI_WEB_URL").unwrap_or_else(|_| DEFAULT_WEB_URL.to_string());
    Url::parse(&raw).unwrap_or_else(|err| {
        panic!("TAURI_WEB_URL must be a valid http(s) URL (got {raw:?}): {err}");
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let web_url = resolve_web_url();

    tauri::Builder::default()
        .setup(move |app| {
            WebviewWindowBuilder::new(app, "main", WebviewUrl::External(web_url))
                .title("TaskFlow")
                .inner_size(1280.0, 800.0)
                .min_inner_size(900.0, 600.0)
                .resizable(true)
                .center()
                .build()?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running TaskFlow desktop");
}
