module.exports = async function ({
    ethers,
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
}) {
    const {deploy} = deployments;
    const {deployer} = await ethers.getNamedSigners();

    let user = await ethers.getContract('User');

    let deployResult = await deploy('LuckyPool', {
        from: deployer.address,
        args: [user.address],
        log: true,
    });
};

module.exports.tags = ['LuckyPool'];
module.exports.dependencies = ['User'];
