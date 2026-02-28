import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

const CRED_URL = 'https://raw.githubusercontent.com/yemo-dev/auth/refs/heads/main/credentials.json'

/**
 * Terminal Authentication System
 * @param {Function} question - Readline question promise
 * @returns {Promise<boolean>}
 */
export async function checkLogin(question) {
    const dbDir = path.resolve('./database')
    const loginFile = path.join(dbDir, 'login.json')

    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir)

    /** Helper to render UI **/
    const renderUI = (msg = '', showExpiry = false, account = null) => {
        /** console.clear() is the standard way to clear Windows/generic terminals **/
        console.clear()

        console.log(chalk.gray('  ─────────────────────────'))
        console.log(chalk.cyan('  [ BIOHAZARD ] ') + chalk.bold.white('ACCESS'))
        console.log(chalk.gray('  ─────────────────────────'))

        if (showExpiry && account) {
            const expiryStr = account.expired === 'unlimited' ? chalk.green('Unlimited') :
                (isNaN(new Date(account.expired).getTime()) ? chalk.red('Invalid Date') : chalk.yellow(`Expires on ${account.expired}`))

            console.log(`  ${chalk.white('User')}   : ${chalk.cyan(account.username)}`)
            console.log(`  ${chalk.white('Status')} : ${expiryStr}`)
            console.log(chalk.gray('  ─────────────────────────'))
        }

        if (msg) console.log('  ' + msg)
    }

    /** Expiration helper **/
    const isExpired = (expiry) => {
        if (expiry === 'unlimited') return false
        const expiryDate = new Date(expiry)
        if (isNaN(expiryDate.getTime())) return false
        return new Date() > expiryDate
    }

    /** Fetch credentials from Remote **/
    let credentials = []
    try {
        const response = await fetch(CRED_URL)
        if (!response.ok) throw new Error('Remote fetch failed')
        credentials = await response.json()
    } catch (err) {
        renderUI(chalk.red(`  [!] ERROR: Failed to fetch remote credentials. (${err.message})`))
        process.exit(1)
    }

    if (fs.existsSync(loginFile)) {
        const loginData = JSON.parse(fs.readFileSync(loginFile, 'utf8'))
        const account = credentials.find(c => c.username === loginData.username && c.password === loginData.password)

        if (account) {
            if (isExpired(account.expired)) {
                renderUI(chalk.red('  [!] LICENSE EXPIRED: Please renew your access.  '), true, account)
                process.exit(1)
            }
            renderUI(chalk.green('  [+] Session active. Resuming...'), true, account)
            await new Promise(resolve => setTimeout(resolve, 3000))
            return true
        }
    }

    let attempts = 0
    let lastError = ''
    while (attempts < 3) {
        renderUI(lastError, false)

        console.log(chalk.white('  >> Authentication Required'))
        console.log(chalk.cyan('  username: '))
        const user = await question('')
        console.log(chalk.cyan('  password: '))
        const pass = await question('')

        const account = credentials.find(c => c.username === user && c.password === pass)

        if (account) {
            if (isExpired(account.expired)) {
                renderUI(chalk.red('  [!] LICENSE EXPIRED: Please renew your access.  '), true, account)
                process.exit(1)
            }
            fs.writeFileSync(loginFile, JSON.stringify({ username: user, password: pass }, null, 2))
            renderUI(chalk.yellow('  [*] Identification verified. Initializing system...'), true, account)
            await new Promise(resolve => setTimeout(resolve, 3000))
            renderUI(chalk.green(`  [+] Access granted. Welcome back, ${account.username}.`), true, account)
            return true
        } else {
            attempts++
            lastError = chalk.red(`  [x] Credentials invalid. (${attempts}/3 attempts)`)
        }
    }

    renderUI(chalk.red('  [x] TERMINAL LOCKDOWN: Security breach detected.  '), false)
    console.log('')
    process.exit(1)
}
