import * as path from "https://deno.land/std/path/mod.ts"

export async function genMeta(root) {
  let list = []
  for await (const entry of Deno.readDir(root)) {
    if (entry.isDirectory) {
      list.push(entry.name)
      genMeta(`${root}/${entry.name}`)
    }
  }
  Deno.writeTextFile(`${root}/dir.lst`, list.join('\n'))
}

genMeta(`${path.join(Deno.cwd(), Deno.args[0])}`)
