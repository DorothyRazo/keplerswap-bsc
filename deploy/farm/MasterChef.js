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

    let deployResult = await deploy('MasterChef', {
        from: deployer.address,
        args: [user.address],
        log: true,
    });
};

module.exports.tags = ['MasterChef'];
module.exports.dependencies = ['User'];
