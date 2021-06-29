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

    tx = await feeDispatcher.connect(deployer).addDefaultDestination(masterChef.address, '7500', 1);
    tx = await tx.wait();
    tx = await feeDispatcher.connect(deployer).addDefaultDestination(masterChef.address, '500', 2);
    tx = await tx.wait();
    tx = await feeDispatcher.connect(deployer).addDefaultDestination(luckyPool.address, '1000', 0);
    tx = await tx.wait();
    tx = await feeDispatcher.connect(deployer).addDefaultDestination(inviter.address, '500', 5);
    tx = await tx.wait();
    tx = await feeDispatcher.connect(deployer).addDefaultDestination(fund, '500', 0);
    tx = await tx.wait();
};

module.exports.tags = ['FeeDispatcher'];
module.exports.dependencies = ['KeplerFactory', 'KeplerToken', 'MasterChef', 'LuckyPool', 'Inviter'];
