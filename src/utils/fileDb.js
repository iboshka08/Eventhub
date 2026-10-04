import { join } from 'path'
import { readFile, writeFile } from 'fs/promises'

const filePath = (name) =>
  join(process.cwd(), 'data', `${name}.json`)

async function readData(name) {
  try {
    const data = await readFile(filePath(name), 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    console.log(`Error is on readData function err: ${err.message}`)
  }
}

async function writeData(name, data) {
  try {
    await writeFile(
      filePath(name),
      JSON.stringify(data, null, 2),
      'utf-8'
    )
  } catch (err) {
    console.log(`Error is on writeData function err: ${err.message}`)
  }
}

export {
  readData,
  writeData
}
