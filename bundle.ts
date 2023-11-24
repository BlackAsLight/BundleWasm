// deno-lint-ignore-file no-empty
import { encodeBase64 } from 'https://deno.land/std@0.208.0/encoding/base64.ts'
// @deno-types="https://deno.land/x/esbuild@v0.19.6/mod.d.ts"
import { build, stop } from 'https://deno.land/x/esbuild@v0.19.6/mod.js'
import { denoPlugins } from 'https://deno.land/x/esbuild_deno_loader@0.8.2/mod.ts'

async function esbuild(inPath: string, outPath: string, minify: boolean): Promise<void> {
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

function sizeInBase64(size: number): number {
	size = Math.ceil(size * 8 / 6)
	return size + (size % 4 === 3 ? 1 : size % 4)
}

function stringToUint8Array(text: string): Uint8Array {
	return Uint8Array.from(text.split('').map(char => char.charCodeAt(0)))
}

const maxDataURLSize = Math.max((parseInt(Deno.env.get('MAX_DATA_URL_SIZE') ?? '0') || Infinity) - 'data:application/wasm,'.length, 1024)
const maxYieldStringSize = Math.max(parseInt(Deno.env.get('MAX_YIELD_STRING_SIZE') ?? '0') || maxDataURLSize === 1024 ? 0 : maxDataURLSize + 'data:application/wasm,'.length, 1024)

try {
	await Deno.remove('./static/js/', { recursive: true })
}
catch { }
finally {
	await Deno.mkdir('./static/js/', { recursive: true })
}

if (sizeInBase64((await Deno.stat('./static/wasm/app_bg.wasm')).size) > maxDataURLSize) {
	const writeFile = await Deno.create('./static/wasm/bundle.ts')
	await writeFile.write(stringToUint8Array('\
import { decodeBase64 } from \'https://deno.land/std@0.208.0/encoding/base64.ts\'\n\
import x from \'./app.js\'\n\
x(new Response(ReadableStream.from((function* () {\n'))
	const readFile = await Deno.open('./static/wasm/app_bg.wasm')
	const buffer = new Uint8Array(maxYieldStringSize)
	let read = await readFile.read(buffer)
	while (read != null) {
		await writeFile.write(stringToUint8Array(`\tyield decodeBase64('${encodeBase64(buffer.slice(0, read))}')\n`))
		read = await readFile.read(buffer)
	}
	await writeFile.write(stringToUint8Array('})())))\n'))
	readFile.close()
	writeFile.close()
}
else
	await Deno.writeTextFile('./static/wasm/bundle.ts', `\
import x from './app.js'\n\
await x(fetch('data:application/wasm;base64,${encodeBase64(await Deno.readFile('./static/wasm/app_bg.wasm'))}'))`)

await Promise.allSettled([
	esbuild('./static/wasm/bundle.ts', './static/js/main.js', false),
	esbuild('./static/wasm/bundle.ts', './static/js/main.min.js', true)
])
stop()

console.log(`bundle.ts: ${performance.now().toLocaleString('en-US', { maximumFractionDigits: 2 })}ms`)
