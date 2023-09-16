release:
	cargo build --release --target=wasm32-unknown-unknown
	mkdir -p static/wasm/
	wasm-bindgen --out-dir static/wasm/ --out-name app --target web --no-typescript target/wasm32-unknown-unknown/release/bundle_wasm.wasm
	deno run --allow-read --allow-write --allow-env --allow-run bundle.ts

debug:
	cargo build --target=wasm32-unknown-unknown
	mkdir -p static/wasm/
	wasm-bindgen --out-dir static/wasm/ --out-name app --target web --no-typescript target/wasm32-unknown-unknown/debug/bundle_wasm.wasm
	deno run --allow-read --allow-write --allow-env --allow-run bundle.ts

clean:
	cargo clean
	rm -rf static/js/ static/wasm/
