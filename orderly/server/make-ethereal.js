import nodemailer from 'nodemailer'

const account = await nodemailer.createTestAccount()
console.log(account)