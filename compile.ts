import path from "path";
import { readdir, readFile, writeFile } from "fs/promises";

/* 
  - still can't use import statement 
    after following the doc to set up 
    the typeRoots at all  
*/
const solc = require("solc");

const contractsPath = path.resolve(__dirname, "contracts");
const abisPath = path.resolve(__dirname, "abis");

const createSolcInput = (content: string, contractName: string) => {
  const input = {
    language: "Solidity",
    sources: {
      [contractName]: {
        content: content,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          /* we only need "abi" and the actual bytecode for deployment */
          "*": ["abi", "evm.bytecode.object"],
        },
      },
    },
  };
  return input;
};

const compileSol = (input: any, contractName: string) => {
  /*
    - don't be confused in how we getting to a 
      certain contract in the output
    - this is just how the output is structured;
      you can look at the files in the abis folder
      and figure this our easily 
  */

  // const compiled = JSON.parse(solc.compile(JSON.stringify(input))).contracts[
  //   contractName
  // ][contractName];

  const {
    [contractName]: { [contractName]: compiled },
  } = JSON.parse(solc.compile(JSON.stringify(input))).contracts;

  const {
    evm: {
      bytecode: { object: bytedoe },
    },
  } = compiled;

  compiled["bytecode"] = bytedoe;

  delete compiled["evm"];

  return compiled;
};

const compileContracts = async () => {
  const files = await readdir(contractsPath);

  files.forEach(async (filename) => {
    const { ext, name: contractName } = path.parse(filename);
    if (ext === ".sol") {
      console.log(`reading ${filename} ...`);
      const solFile = path.join(contractsPath, filename);
      const content = await readFile(solFile, "utf-8");
      const input = createSolcInput(content, contractName);

      console.log(`compiling ${filename} ...`);
      const compiled = compileSol(input, contractName);

      const abisFilename = path.join(abisPath, contractName + ".json");

      await writeFile(abisFilename, JSON.stringify(compiled), {
        encoding: "utf-8",
      });

      console.log(`${abisFilename} generated.`);
    } else {
      console.error(`skipping ${filename} as its extension name is not .sol`);
    }
  });
};

compileContracts();
