//const { TOKEN, RICHACCOUNT } = require('../config/address.js');
const chai = require("chai");
const expect = chai.expect;
//console.dir(chai);
//chai.should()
//chai.use(chaiAsPromised)

describe("LuckyPool", () => {

    before(async function () {
        await deployments.fixture(['User', 'LuckyPool']);
        let { deployer } = await ethers.getNamedSigners();
        this.deployer = deployer;
        this.luckyPool = await ethers.getContract('LuckyPool');

        let signers = await ethers.getSigners();
        this.caller = signers[9];
    });

    beforeEach(async function () {
    });

    it("Random", async function() {
        console.log(await this.luckyPool.win("1"));
        console.log(await this.luckyPool.win("2"));
        console.log(await this.luckyPool.win("3"));
        console.log(await this.luckyPool.win("4"));
        console.log(await this.luckyPool.win("5"));
        console.log(await this.luckyPool.win("6"));
        console.log(await this.luckyPool.win("7"));
        console.log(await this.luckyPool.win("8"));
        console.log(await this.luckyPool.win("9"));
        console.log(await this.luckyPool.win("10"));
        console.log(await this.luckyPool.win("11"));
        console.log(await this.luckyPool.win("12"));
        console.log(await this.luckyPool.win("13"));
        console.log(await this.luckyPool.win("14"));
        console.log(await this.luckyPool.win("15"));
        console.log(await this.luckyPool.win("16"));
        console.log(await this.luckyPool.win("17"));
        console.log(await this.luckyPool.win("18"));
        console.log(await this.luckyPool.win("19"));
        console.log(await this.luckyPool.win("20"));
    });

});
