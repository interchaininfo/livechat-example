declare const chainInfo: {
    chainName: string;
    chainId: string;
    rpc: string;
    rest: string;
    stakeCurrency: {
        coinDenom: string;
        coinMinimalDenom: string;
        coinDecimals: number;
        coinGeckoId: string;
        coinImageUrl: string;
    };
    bip44: {
        coinType: number;
    };
    bech32Config: import("@keplr-wallet/types").Bech32Config;
    currencies: {
        coinDenom: string;
        coinMinimalDenom: string;
        coinDecimals: number;
        coinGeckoId: string;
        coinImageUrl: string;
    }[];
    feeCurrencies: {
        coinDenom: string;
        coinMinimalDenom: string;
        coinDecimals: number;
        coinGeckoId: string;
        coinImageUrl: string;
    }[];
};
export default chainInfo;
