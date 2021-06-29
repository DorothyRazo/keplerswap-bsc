//const { TOKEN, RICHACCOUNT } = require('../config/address.js');
const chai = require("chai");
const expect = chai.expect;
//console.dir(chai);
//chai.should()
//chai.use(chaiAsPromised)

describe("Swap", () => {

    before(async function () {
        await deployments.fixture(['MockToken', 'KeplerFactory', 'KeplerRouter', 'FeeDispatcher', 'Lens']);
        let { deployer, feeTo } = await ethers.getNamedSigners();
        this.deployer = deployer;
        const {fund, vote} = await getNamedAccounts();
        this.fund = fund;
        this.vote = vote;

        this.keplerFactory = await ethers.getContract('KeplerFactory');
        this.keplerRouter = await ethers.getContract('KeplerRouter');
        this.feeDispatcher = await ethers.getContract('FeeDispatcher');
        this.keplerToken = await ethers.getContract('KeplerToken');
        this.masterChef = await ethers.getContract('MasterChef');
        this.inviterContract = await ethers.getContract('Inviter');
        this.luckyPool = await ethers.getContract('LuckyPool');
        this.lens = await ethers.getContract('Lens');
        this.user = await ethers.getContract('User');
        this.WBNB = await ethers.getContract('MockToken_WBNB');
        this.USDT = await ethers.getContract('MockToken_USDT');
        this.AAVE = await ethers.getContract('MockToken_AAVE');

        let signers = await ethers.getSigners();
        this.inviter = signers[1];
        this.caller = signers[2];
        this.destination1 = signers[9];
        this.destination2 = signers[8];
        this.destination3 = signers[7];
        this.destination4 = signers[6];
        this.destination5 = signers[5];
        this.destination6 = signers[4];
        this.destination7 = signers[3];
        
        this.fund = this.destination1;
        this.vote = this.destination2;

    });

    beforeEach(async function () {
    });

    it("Registe", async function() {
        await this.user.connect(this.inviter).registe('0x0000000000000000000000000000000000000001');
        await this.user.connect(this.caller).registe(this.inviter.address);
    });
        
    it("CreateAndDeposit", async function() {
        await this.USDT.mint(this.caller.address, '10000000000000000000');
        await this.AAVE.mint(this.caller.address, '10000000000000000000');
        
        await this.USDT.connect(this.caller).approve(this.keplerRouter.address, '10000000000000000000');
        await this.AAVE.connect(this.caller).approve(this.keplerRouter.address, '10000000000000000000');
        
        expect(await this.keplerFactory.getPair(this.USDT.address, this.AAVE.address)).to.be.equal('0x0000000000000000000000000000000000000000');
        await this.keplerRouter.connect(this.caller).addLiquidity(
            this.USDT.address,
            this.AAVE.address,
            '10000000000000000000',
            '10000000000000000000',
            '10000000000000000000',
            '10000000000000000000',
            this.caller.address,
            Math.floor(new Date().getTime() / 1000) + 1000,
        );
        expect(await this.USDT.balanceOf(this.caller.address)).to.be.equal('0');
        expect(await this.AAVE.balanceOf(this.caller.address)).to.be.equal('0');
        expect(await this.keplerFactory.getPair(this.USDT.address, this.AAVE.address)).to.be.not.equal('0x0000000000000000000000000000000000000000');
        this.pairUSDT_AAVE = await ethers.getContractAt('KeplerPair', await this.keplerFactory.getPair(this.USDT.address, this.AAVE.address));
        expect(await this.pairUSDT_AAVE.balanceOf(this.caller.address)).to.be.equal('10000000000000000000');

        await this.USDT.mint(this.inviter.address, '10000000000000000000');
        await this.AAVE.mint(this.inviter.address, '10000000000000000000');
        
        await this.USDT.connect(this.inviter).approve(this.keplerRouter.address, '10000000000000000000');
        await this.AAVE.connect(this.inviter).approve(this.keplerRouter.address, '10000000000000000000');
        
        //expect(await this.keplerFactory.getPair(this.USDT.address, this.AAVE.address)).to.be.equal('0x0000000000000000000000000000000000000000');
        await this.keplerRouter.connect(this.inviter).addLiquidity(
            this.USDT.address,
            this.AAVE.address,
            '10000000000000000000',
            '10000000000000000000',
            '10000000000000000000',
            '10000000000000000000',
            this.inviter.address,
            Math.floor(new Date().getTime() / 1000) + 1000,
        );
        expect(await this.USDT.balanceOf(this.inviter.address)).to.be.equal('0');
        expect(await this.AAVE.balanceOf(this.inviter.address)).to.be.equal('0');
        //expect(await this.keplerFactory.getPair(this.USDT.address, this.AAVE.address)).to.be.not.equal('0x0000000000000000000000000000000000000000');
        //this.pairUSDT_AAVE = await ethers.getContractAt('KeplerPair', await this.keplerFactory.getPair(this.USDT.address, this.AAVE.address));
        expect(await this.pairUSDT_AAVE.balanceOf(this.inviter.address)).to.be.equal('10000000000000000000');

        await this.USDT.mint(this.caller.address, '10000000000000000000');
        await this.keplerToken.connect(this.deployer).mint(this.caller.address, '10000000000000000000');
        
        await this.USDT.connect(this.caller).approve(this.keplerRouter.address, '10000000000000000000');
        await this.keplerToken.connect(this.caller).approve(this.keplerRouter.address, '10000000000000000000');
        
        expect(await this.keplerFactory.getPair(this.USDT.address, this.keplerToken.address)).to.be.equal('0x0000000000000000000000000000000000000000');
        await this.keplerRouter.connect(this.caller).addLiquidity(
            this.USDT.address,
            this.keplerToken.address,
            '10000000000000000000',
            '10000000000000000000',
            '10000000000000000000',
            '10000000000000000000',
            this.caller.address,
            Math.floor(new Date().getTime() / 1000) + 1000,
        );
        expect(await this.USDT.balanceOf(this.caller.address)).to.be.equal('0');
        expect(await this.keplerToken.balanceOf(this.caller.address)).to.be.equal('0');
        expect(await this.keplerFactory.getPair(this.USDT.address, this.keplerToken.address)).to.be.not.equal('0x0000000000000000000000000000000000000000');
        this.pairUSDT_SDS = await ethers.getContractAt('KeplerPair', await this.keplerFactory.getPair(this.USDT.address, this.keplerToken.address));
        expect(await this.pairUSDT_SDS.balanceOf(this.caller.address)).to.be.equal('10000000000000000000');
    });

    it("LockLiquidity", async function() {
        await this.pairUSDT_AAVE.connect(this.caller).approve(this.masterChef.address, '10000000000000000000');
        await this.masterChef.connect(this.caller).deposit(this.pairUSDT_AAVE.address, '10000000000000000000', 0);
        await this.pairUSDT_AAVE.connect(this.inviter).approve(this.masterChef.address, '10000000000000000000');
        await this.masterChef.connect(this.inviter).deposit(this.pairUSDT_AAVE.address, '10000000000000000000', 0);
    });

    it("SwapToken", async function() {
        await this.USDT.mint(this.caller.address, '1000000000000000000'); 
        expect(await this.USDT.balanceOf(this.caller.address)).to.be.equal('1000000000000000000');
        expect(await this.AAVE.balanceOf(this.caller.address)).to.be.equal('0');
        await this.USDT.connect(this.caller).approve(this.keplerRouter.address, '1000000000000000000');
        await this.keplerRouter.connect(this.caller).swapExactTokensForTokens(
            '1000000000000000000',
            '0',
            [this.USDT.address, this.AAVE.address],
            this.caller.address,
            Math.floor(new Date().getTime() / 1000) + 1000,
        );
        expect(await this.USDT.balanceOf(this.caller.address)).to.be.equal('0');
        //expect(await this.AAVE.balanceOf(this.caller.address)).to.be.above('0');
        console.log("swap get amount: ", (await this.AAVE.balanceOf(this.caller.address)).toString());
    });

    it("Claim", async function() {
        pending = await this.lens.pendingMine(this.masterChef.address, this.pairUSDT_AAVE.address, this.USDT.address, this.caller.address);
        console.log("pending USDT: ", pending.toString());
        balanceBefore = await this.USDT.balanceOf(this.caller.address);
        await this.masterChef.connect(this.caller).claimMine(this.pairUSDT_AAVE.address, this.USDT.address);
        balanceAfter = await this.USDT.balanceOf(this.caller.address);
        console.log("claim inviter USDT: ", balanceAfter.sub(balanceBefore).toString());
        expect(balanceAfter.sub(balanceBefore)).to.be.equal(pending);
    });
});
