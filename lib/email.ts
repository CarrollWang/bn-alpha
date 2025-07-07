// 邮件服务工具类
// 支持多种邮件服务提供商

interface EmailConfig {
  provider: 'sendgrid' | 'ses' | 'smtp'
  apiKey?: string
  smtpConfig?: {
    host: string
    port: number
    secure: boolean
    auth: {
      user: string
      pass: string
    }
  }
}

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export class EmailService {
  private config: EmailConfig

  constructor(config: EmailConfig) {
    this.config = config
  }

  async sendTransactionAlert(
    to: string,
    walletLabel: string,
    transaction: {
      hash: string
      from: string
      to: string
      value: string
      token: string
      timestamp: string
      type: 'incoming' | 'outgoing'
    }
  ) {
    const template = this.generateTransactionTemplate(walletLabel, transaction)
    
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
  }

  private generateTransactionTemplate(walletLabel: string, transaction: any): EmailTemplate {
    const isIncoming = transaction.type === 'incoming'
    const direction = isIncoming ? '转入' : '转出'
    const emoji = isIncoming ? '📈' : '📉'
    
    const subject = `${emoji} ${walletLabel} - 检测到${direction}交易`
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>钱包监控通知</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .transaction { background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; }
            .amount { font-size: 24px; font-weight: bold; color: ${isIncoming ? '#28a745' : '#dc3545'}; }
            .details { margin-top: 20px; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f8f9fa; }
            .label { font-weight: bold; }
            .value { font-family: monospace; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${emoji} 钱包监控通知</h2>
              <p>您监控的钱包 <strong>${walletLabel}</strong> 检测到新的${direction}交易</p>
            </div>
            
            <div class="transaction">
              <div class="amount">${isIncoming ? '+' : '-'}${transaction.value} ${transaction.token}</div>
              
              <div class="details">
                <div class="detail-row">
                  <span class="label">交易哈希:</span>
                  <span class="value">${transaction.hash}</span>
                </div>
                <div class="detail-row">
                  <span class="label">发送方:</span>
                  <span class="value">${transaction.from}</span>
                </div>
                <div class="detail-row">
                  <span class="label">接收方:</span>
                  <span class="value">${transaction.to}</span>
                </div>
                <div class="detail-row">
                  <span class="label">时间:</span>
                  <span class="value">${new Date(transaction.timestamp).toLocaleString()}</span>
                </div>
              </div>
              
              <div style="margin-top: 20px;">
                <a href="https://bscscan.com/tx/${transaction.hash}" 
                   style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                  查看交易详情
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p>这是一封自动发送的邮件，请勿回复。</p>
              <p>如需停止监控，请登录 Web3 工具站进行管理。</p>
            </div>
          </div>
        </body>
      </html>
    `
    
    const text = `
      钱包监控通知
      
      您监控的钱包 ${walletLabel} 检测到新的${direction}交易
      
      金额: ${isIncoming ? '+' : '-'}${transaction.value} ${transaction.token}
      交易哈希: ${transaction.hash}
      发送方: ${transaction.from}
      接收方: ${transaction.to}
      时间: ${new Date(transaction.timestamp).toLocaleString()}
      
      查看详情: https://bscscan.com/tx/${transaction.hash}
    `
    
    return { subject, html, text }
  }

  private async sendEmail(params: {
    to: string
    subject: string
    html: string
    text: string
  }) {
    switch (this.config.provider) {
      case 'sendgrid':
        return this.sendWithSendGrid(params)
      case 'ses':
        return this.sendWithSES(params)
      case 'smtp':
        return this.sendWithSMTP(params)
      default:
        throw new Error('Unsupported email provider')
    }
  }

  private async sendWithSendGrid(params: any) {
    // SendGrid 实现
    console.log('使用 SendGrid 发送邮件:', params.subject)
    // 实际项目中应该使用 @sendgrid/mail
  }

  private async sendWithSES(params: any) {
    // AWS SES 实现
    console.log('使用 AWS SES 发送邮件:', params.subject)
    // 实际项目中应该使用 aws-sdk
  }

  private async sendWithSMTP(params: any) {
    // SMTP 实现
    console.log('使用 SMTP 发送邮件:', params.subject)
    // 实际项目中应该使用 nodemailer
  }
}

// 默认邮件服务实例
export const emailService = new EmailService({
  provider: 'smtp', // 可以通过环境变量配置
  smtpConfig: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },
})