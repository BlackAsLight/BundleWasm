// deno-lint-ignore-file no-empty
// @deno-types="https://deno.land/x/esbuild@v0.17.19/mod.d.ts"
import { build, stop } from 'https://deno.land/x/esbuild@v0.17.19/mod.js'
import { denoPlugins } from 'https://deno.land/x/esbuild_deno_loader@0.7.0/mod.ts'

async function esbuild(inPath: string, outPath: string, minify: boolean) {
	const { errors, warnings } = await build({
		plugins: denoPlugins(),
		entryPoints: [ inPath ],
		outfile: outPath,
		format: 'esm',
		bundle: true,
		minify
	})
	errors.forEach(error => console.error(error))
	warnings.forEach(warning => console.warn(warning))
}

try {
	await Deno.remove('./static/js/', { recursive: true })
}
catch { }
finally {
	await Deno.mkdir('./static/js/', { recursive: true })
}

await Deno.writeTextFile('./static/wasm/bundle.js', `import { initSync } from 'app.js'\ninitSync(new WebAssembly.Module(Uint8Array.from(atob('${btoa([ ...await Deno.readFile('./static/wasm/app_bg.wasm') ].map(byte => String.fromCharCode(byte)).join(''))}').split('').map(char => char.charCodeAt(0)))))`)

await esbuild('./static/wasm/bundle.js', './static/js/main.js', false)
await esbuild('./static/wasm/bundle.js', './static/js/main.min.js', true)
stop()

await Deno.remove('./static/wasm/', { recursive: true })
console.log(`${performance.now().toLocaleString('en-US', { maximumFractionDigits: 2 })}ms`)
