require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("hardhat-spdx-license-identifier");
require('hardhat-deploy');
require ('hardhat-abi-exporter');
require("@nomiclabs/hardhat-ethers");
require('hardhat-contract-sizer');
require("dotenv/config")

let accounts = [];
var fs = require("fs");
var read = require('read');
var util = require('util');
const keythereum = require("keythereum");
const prompt = require('prompt-sync')();
(async function() {
    try {
        const root = '.keystore';
        var pa = fs.readdirSync(root);
        for (let index = 0; index < pa.length; index ++) {
            let ele = pa[index];
            let fullPath = root + '/' + ele;
		    var info = fs.statSync(fullPath);
            //console.dir(ele);
		    if(!info.isDirectory() && ele.endsWith(".keystore")){
                const content = fs.readFileSync(fullPath, 'utf8');
                const json = JSON.parse(content);
                const password = prompt('Input password for 0x' + json.address + ': ', {echo: '*'});
                //console.dir(password);
                const privatekey = keythereum.recover(password, json).toString('hex');
                //console.dir(privatekey);
                accounts.push('0x' + privatekey);
                //console.dir(keystore);
		    }
	    }
    } catch (ex) {
    }
    try {
        const file = '.secret';
        var info = fs.statSync(file);
        if (!info.isDirectory()) {
            const content = fs.readFileSync(file, 'utf8');
            let lines = content.split('\n');
            for (let index = 0; index < lines.length; index ++) {
                let line = lines[index];
                if (line == undefined || line == '') {
                    continue;
                }
                if (!line.startsWith('0x') || !line.startsWith('0x')) {
                    line = '0x' + line;
                }
                accounts.push(line);
            }
        }
    } catch (ex) {
    }
})();
module.exports = {
    defaultNetwork: "hardhat",
    abiExporter: {
        path: "./abi",
        clear: false,
        flat: true,
        // only: [],
        // except: []
    },
    namedAccounts: {
        deployer: {
            default: 0,
            97: '0x5C7b53292f4444674A674667887E781e4C4649d7',
            256: '0x41a33c1a6b8aa7c5968303AE79d416d0889f35E1',
        },
        /*
        admin: {
            default: 1,
            128: '0x78194d4aE6F0a637F563482cAc143ecE532E8847',
            256: '0x4f7b45C407ec1B106Ba3772e0Ecc7FD4504d3b92',
        },
        */
        fund: {
            default: 1,
            97: '0x5C7b53292f4444674A674667887E781e4C4649d7',
            256: '0x4f7b45C407ec1B106Ba3772e0Ecc7FD4504d3b92',
        },
    },
    networks: {
        mainnet: {
            //url: `https://bsc-dataseed3.binance.org`,
            url: `https://bsc-dataseed1.defibit.io/`,
            accounts: accounts,
            //gasPrice: 1.3 * 1000000000,
            chainId: 56,
            gasMultiplier: 1.5,
        },
        test: {
            url: `https://data-seed-prebsc-1-s1.binance.org:8545`,
            accounts: accounts,
            //gasPrice: 1.3 * 1000000000,
            chainId: 97,
            tags: ["test"],
        },
        hardhat: {
            forking: {
                enabled: false,
                //url: `https://bsc-dataseed1.defibit.io/`
                url: `https://bsc-dataseed1.ninicoin.io/`,
                //url: `https://bsc-dataseed3.binance.org/`
                //url: `https://data-seed-prebsc-1-s1.binance.org:8545`
                //blockNumber: 8215578,
            },
            live: true,
            saveDeployments: true,
            tags: ["test", "local"],
            //chainId: 56,
            timeout: 2000000,
        }
    },
    solidity: {
        /*
        version: "0.5.16",
        settings: {
            optimizer: {
                enabled: true,
            }
        }
        */
        compilers: [
            {
                version: "0.7.2",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    contractSizer: {
        alphaSort: true,
        runOnCompile: true
    },
    spdxLicenseIdentifier: {
        overwrite: true,
        runOnCompile: true,
    },
    mocha: {
        timeout: 2000000,
    },
    etherscan: {
     apiKey: process.env.BSC_API_KEY,
   }
};
