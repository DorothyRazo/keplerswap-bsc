module.exports = async function ({
    ethers,
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
}) {
    const {deploy} = deployments;
    const {deployer} = await ethers.getNamedSigners();

    let deployResult = await deploy('KeplerFactory', {
        from: deployer.address,
        args: [],
        log: true,
    });

    let keplerFactory = await ethers.getContract('KeplerFactory');
    let keplerToken = await ethers.getContract('KeplerToken');
    tx = await keplerFactory.setDefaultTransferFee('3');
    tx = await tx.wait();
    tx = await keplerFactory.setTokenTransferFee(keplerToken.address, '60');
    tx = await tx.wait();
    tx = await keplerFactory.setRelateTransferFee(keplerToken.address, '20');
    tx = await tx.wait();
};

module.exports.tags = ['KeplerFactory'];
module.exports.dependencies = ['KeplerToken'];
