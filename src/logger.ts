import chalk from 'chalk';
import fs from 'fs';
import cluster from 'cluster';

let activeStyle = process.env.LOG_STYLE ?? "MEDIUM"
let emojisEnabled = !!(parseInt(process.env.LOG_EMOJIS as string) ?? true)

const emojis = ['⏹', 'ℹ', '⚠', '☢', '✔']
const styles = {
  SHORT: ['M', 'I', 'W', 'E', 'S'],
  MEDIUM: ['MOD', 'INF', 'WRN', 'ERR', 'SCS'],
  LONG: ['MODULE ', 'INFO   ', 'WARN   ', 'ERROR  ', 'SUCCESS']
}
const style = (level: number) => {
  // @ts-ignore
  return `${emojisEnabled ? emojis[level] + '  ' : ''}${styles[activeStyle][level]}`
}

if (!(activeStyle in styles)) {
  console.error(`Style ${activeStyle} is not a valid logging style. Defaulting to MEDIUM.`)
  activeStyle = 'MEDIUM'
}

let _ = {
  module: chalk.blue,
  log: (...x: any[]) => x,
  warn: chalk.yellowBright,
  error: chalk.bgRedBright.black,
  success: chalk.greenBright
}

export default function register (name: string) {
  const clusterName = cluster.isWorker ? `${cluster.worker!.id}` : `Main`;

  console.log(_.module(`[ ${(Date.now()/1000).toFixed(3)} ${style(0)} | ${name}@${clusterName}] Registered new module ${name}.`));

  return {
    log: (...data: any[]) => {
      if (process.env.NODE_ENV !== "TEST") {
        console.log(`[ ${(Date.now() / 1000).toFixed(3)} ${style(1)} | ${name}@${clusterName}]`, ...data)
      }
    },
    warn: (...data: any[]) => {
      if (process.env.NODE_ENV === "TEST") return
      console.warn(_.warn(`[ ${(Date.now() / 1000).toFixed(3)} ${style(2)} | ${name}@${clusterName}]`, ...data))
    },
    error: (...data: any[]) => {
      if (process.env.NODE_ENV === "TEST") return
      console.error(_.error(`[ ${(Date.now() / 1000).toFixed(3)} ${style(3)} | ${name}@${clusterName}]`, ...data))
    },
    success: (...data: any[]) => {
      if (process.env.NODE_ENV === "TEST") return
      console.log(_.success(`[ ${(Date.now() / 1000).toFixed(3)} ${style(4)} | ${name}@${clusterName}]`,...data))
    },
  }
}
