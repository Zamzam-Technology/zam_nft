const TrillioHeirs = artifacts.require("TrillioHeirs")

module.exports = async function (deployer) {
	await deployer.deploy(TrillioHeirs, "ZamNft", "ZAM", "baseURI/");
};
