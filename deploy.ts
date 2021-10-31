import path from "path";
import fs from "fs";
import { readFile, writeFile, readdir } from "fs/promises";
import HDWalletProvider from "@truffle/hdwallet-provider";
import Web3 from "web3";
import {
  Secret,
  InitSecret,
  ContractDeployment,
  DeployedContract,
} from "./types/deploy";

const checkSecrets = async () => {
  const secretsPath = path.resolve(__dirname, "secrets");
  const filename = path.join(secretsPath, "mysecrets.json");

  console.log(`checking secrets in ${filename}...`);

  if (!fs.existsSync(filename)) {
    await writeFile(filename, JSON.stringify(InitSecret), {
      encoding: "utf-8",
    });
    console.log(
      "secret file created - set up the secrets before the deployment "
    );
    return undefined;
  }

  const secret = JSON.parse(await readFile(filename, "utf8")) as Secret;

  let proceed = true;
  if (secret.infuraApiKey === "PUT_YOUR_API_KEY_HERE") {
    proceed = false;
    console.error("Setup your Infura API Key ");
  }
  if (secret.infuraEndpoint === "PUT_YOUR_ENDPOINT_HERE") {
    proceed = false;
    console.error("Setup your Infura Endpoint");
  }
  if (secret.mnemonic === "PUT_YOUR_MNEMONIC_HERE") {
    proceed = false;
    console.error("Setup your Infura API Key ");
  }
  console.log("looks secrets has been setup.");
  return proceed ? secret : undefined;
};

const prepareContracts = async (): Promise<ContractDeployment[]> => {
  const contracts: ContractDeployment[] = [];
  const deploymentPath = path.resolve(__dirname, "deployment");
  const abisPath = path.resolve(__dirname, "abis");

  const files = await readdir(abisPath);

  for (const filename of files) {
    const { ext, name: contractName } = path.parse(filename);

    if (ext !== ".json") {
      console.log(`skip ${filename}`);
      continue;
    }
    const fullname = path.join(abisPath, filename);
    const { abi, bytecode } = JSON.parse(
      await readFile(fullname, { encoding: "utf-8" })
    );

    contracts.push({
      contractName,
      abi,
      bytecode,
      outputFilename: path.join(deploymentPath, filename),
    });
  }

  return contracts;
};

const deploy = async () => {
  const secret = await checkSecrets();
  if (!secret) {
    console.log("deployment cancelled");
    return;
  }

  const provider = new HDWalletProvider(secret.mnemonic, secret.infuraEndpoint);
  /*#01-02 */
  const web3 = new Web3(provider);
  const [account] = await web3.eth.getAccounts();

  const contracts = await prepareContracts();

  for (const contract of contracts) {
    console.log(`deploying ${contract.contractName}...`);
    /*#01-03 */
    const result = await new web3.eth.Contract(contract.abi)
      .deploy({ data: contract.bytecode })
      .send({ gas: 1000000, from: account });

    console.log(`${contract.contractName} deployed.`);

    const deployed: DeployedContract = {
      address: result.options.address,
      accountUsedToDeploy: account,
    };

    console.log(`generating ${contract.outputFilename}...`);

    await writeFile(contract.outputFilename, JSON.stringify(deployed), {
      encoding: "utf-8",
    });
  }

  console.log("done!");
  provider.engine.stop();
};

deploy();
