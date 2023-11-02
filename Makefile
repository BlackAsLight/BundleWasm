release:
	cargo build --release --target=wasm32-unknown-unknown
	mkdir -p static/wasm/
	wasm-bindgen --out-dir static/wasm/ --out-name app --target web --omit-default-module-path --no-typescript target/wasm32-unknown-unknown/release/bundle_wasm.wasm
	deno run --allow-read --allow-write --allow-env --allow-run bundle.ts
	rm -rf static/wasm/

debug:
	cargo build --target=wasm32-unknown-unknown
	mkdir -p static/wasm/
	wasm-bindgen --out-dir static/wasm/ --out-name app --target web --omit-default-module-path --no-typescript target/wasm32-unknown-unknown/debug/bundle_wasm.wasm
	deno run --allow-read --allow-write --allow-env --allow-run bundle.ts

clean:
	cargo clean
	rm -rf static/js/ static/wasm/

lock:
	deno cache --lock-write bundle.ts
