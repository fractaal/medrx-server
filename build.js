const { exec, execSync } = require('child_process')
const args = process.argv.slice(2);

const cmd = (command) => {
  /*
  return new Promise((resolve, reject) => {
    const thing = exec(command, (err, stdout) => {
      if (err) reject(err); else resolve(stdout)
    })
    thing.stdout.pipe(process.stdout)
  })
   */
  const child = exec(command)
  child.stdout.pipe(process.stdout)
  return new Promise((resolve, reject) => {
    child.addListener("error", reject)
    child.addListener("exit", resolve)
  })
}

(async () => {

    console.log("Installing Yarn...")
    await cmd ("npm install --global yarn")

    console.log("Installing TypeScript Compiler...")
    await cmd ("yarn global add typescript")

  await cmd ("yarn install --production=false")
  await cmd ("npx tsc")

  console.log("Build complete!")
})()