// import wretch from 'wretch'

// const url = 'http://fund.eastmoney.com/data/FundGuideapi.aspx?dt=0&rs=1y,100_1n,100_3n,100_2n,100'

// function getFunds () {
//   return wretch(url).json(({ data }) => {
//     return JSON.parse(data.slice(14)).datas.map(x => x.split(','))
//   })
// }

export async function handle (): Promise<string> {
  return 'it worked'
}
