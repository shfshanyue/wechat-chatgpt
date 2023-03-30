import axios from 'axios'

const url = 'http://fund.eastmoney.com/data/FundGuideapi.aspx?dt=0&rs=1y,100_1n,100_3n,100_2n,100'

function getFunds () {
  return axios.get(url).then(({ data }) => {
    return JSON.parse(data.slice(14)).datas.map(x => x.split(','))
  })
}

export async function handle (): Promise<string> {
  const funds = await getFunds()
  return funds.map((fund: string[]) => `${fund[0]}: ${fund[1]}`).join('\n')
}
