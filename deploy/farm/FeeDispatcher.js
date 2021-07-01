module.exports = async function ({
    ethers,
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
}) {
    const {deploy} = deployments;
    const {deployer} = await ethers.getNamedSigners();
    const {fund} = await getNamedAccounts();

    let deployResult = await deploy('FeeDispatcher', {
        from: deployer.address,
        args: [],
        log: true,
    });

    let keplerFactory = await ethers.getContract('KeplerFactory');
    let feeDispatcher = await ethers.getContract('FeeDispatcher');
    let currentFeeTo = await keplerFactory.feeTo();
    if (currentFeeTo != feeDispatcher.address) {
        tx = await keplerFactory.connect(deployer).setFeeTo(feeDispatcher.address);
        tx = await tx.wait();
        console.dir("set feeTo: " + feeDispatcher.address);
        console.dir(tx);
    }

    let keplerToken = await ethers.getContract('KeplerToken');
    let masterChef = await ethers.getContract('MasterChef');
    let luckyPool = await ethers.getContract('LuckyPool');
    let inviter = await ethers.getContract('Inviter');
    let crycle = await ethers.getContract('Crycle');
    let defaultDestinationNum = await feeDispatcher.defaultDestinationLength();
    if (parseInt(defaultDestinationNum.toString()) <= 0) {
        tx = await feeDispatcher.connect(deployer).addDefaultDestination(masterChef.address, '7500', 1);
        tx = await tx.wait();
    }
    if (parseInt(defaultDestinationNum.toString()) <= 1) {
        tx = await feeDispatcher.connect(deployer).addDefaultDestination(masterChef.address, '500', 2);
        tx = await tx.wait();
    }
    if (parseInt(defaultDestinationNum.toString()) <= 2) {
        tx = await feeDispatcher.connect(deployer).addDefaultDestination(luckyPool.address, '1000', 0);
        tx = await tx.wait();
    }
    if (parseInt(defaultDestinationNum.toString()) <= 3) {
        tx = await feeDispatcher.connect(deployer).addDefaultDestination(inviter.address, '500', 5);
        tx = await tx.wait();
    }
    if (parseInt(defaultDestinationNum.toString()) <= 3) {
        tx = await feeDispatcher.connect(deployer).addDefaultDestination(fund, '500', 0);
        tx = await tx.wait();
    }

    let tokenDestinationNum = await feeDispatcher.tokenDestinationLength(keplerToken.address);
    if (parseInt(tokenDestinationNum.toString()) <= 0) {
        tx = await feeDispatcher.connect(deployer).addTokenDestination(keplerToken.address, crycle.address, '1500', 0);
        tx = await tx.wait();
    }
    if (parseInt(tokenDestinationNum.toString()) <= 1) {
        tx = await feeDispatcher.connect(deployer).addTokenDestination(keplerToken.address, masterChef.address, '5000', 1);
        tx = await tx.wait();
    }
    if (parseInt(tokenDestinationNum.toString()) <= 2) {
        tx = await feeDispatcher.connect(deployer).addTokenDestination(keplerToken.address, crycle.address, '100', 0);
        tx = await tx.wait();
    }
    if (parseInt(tokenDestinationNum.toString()) <= 3) {
        tx = await feeDispatcher.connect(deployer).addTokenDestination(keplerToken.address, masterChef.address, '400', 2);
        tx = await tx.wait();
    }
    if (parseInt(tokenDestinationNum.toString()) <= 4) {
        tx = await feeDispatcher.connect(deployer).addTokenDestination(keplerToken.address, luckyPool.address, '2000', 0);
        tx = await tx.wait();
    }
    if (parseInt(tokenDestinationNum.toString()) <= 5) {
        tx = await feeDispatcher.connect(deployer).addTokenDestination(keplerToken.address, inviter.address, '500', 5);
        tx = await tx.wait();
    }
    if (parseInt(tokenDestinationNum.toString()) <= 6) {
        tx = await feeDispatcher.connect(deployer).addTokenDestination(keplerToken.address, fund, '500', 0);
        tx = await tx.wait();
    }
};

module.exports.tags = ['FeeDispatcher'];
module.exports.dependencies = ['KeplerFactory', 'KeplerToken', 'MasterChef', 'LuckyPool', 'Inviter', 'Crycle'];
