export interface Secret {
  infuraApiKey: string | "PUT_YOUR_API_KEY_HERE";
  infuraEndpoint: string | "PUT_YOUR_ENDPOINT_HERE";
  mnemonic: string | "PUT_YOUR_MNEMONIC_HERE";
}

export const InitSecret: Secret = {
  infuraApiKey: "PUT_YOUR_API_KEY_HERE",
  infuraEndpoint: "PUT_YOUR_ENDPOINT_HERE",
  mnemonic: "PUT_YOUR_MNEMONIC_HERE",
};

export interface ContractDeployment {
  contractName: string;
  abi: any;
  bytecode: any;
  outputFilename: string;
}

export interface DeployedContract {
  address: string;
  accountUsedToDeploy: string;
}
