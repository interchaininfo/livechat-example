import { Bech32Address } from '@keplr-wallet/cosmos'

const currency = {
  coinDenom: 'JUNO',
  coinMinimalDenom: 'ujuno',
  coinDecimals: 6,
  coinGeckoId: 'juno',
  coinImageUrl:
    'https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.png',
}

const chainInfo = {
  chainName: 'juno',
  chainId: 'juno-1',
  rpc: 'https://juno-rpc.polkachu.com:443/',
  rest: 'https://juno-api.polkachu.com/',
  stakeCurrency: currency,
  bip44: {
    coinType: 118,
  },
  bech32Config: Bech32Address.defaultBech32Config('juno'),
  currencies: [currency],
  feeCurrencies: [currency],
}

export default chainInfo
