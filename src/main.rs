use leptos::*;
use leptos_meta::{provide_meta_context, Title};
use log::Level;

fn main() {
	console_error_panic_hook::set_once();
	console_log::init_with_level(Level::Debug).unwrap();

	leptos::mount_to_body(move |cx| view! { cx, <App /> });
}

#[component]
fn App(cx: Scope) -> impl IntoView {
	provide_meta_context(cx);

	view! { cx,
		<Title text="Home" />

		<h1>"Hello World!"</h1>
		<p>"How are you today?"</p>
	}
}
