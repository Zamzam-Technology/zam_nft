const {MerkleTree} = require("merkletreejs")
const keccak256 = require("keccak256")

const whitelist = require("./whitelist.json")

function makeMerkleTree(level) {
    let addresses = []
    for(let i = 0 ; i < whitelist.length ; i++) {
        // please check if the type of function parameter `level` is number.
        if(whitelist[i].level == level)
            addresses.push(whitelist[i].wallet)
    }
    let leafNodes = addresses.map(item => keccak256(item))
    let tree = new MerkleTree(leafNodes, keccak256, {sortPairs: true})
    return tree
}

function getMerkleTreeRoot(tree) {
    return tree.getHexRoot()
}

function getProof(tree, address) {
    const proof = tree.getHexProof(keccak256(address));
    return proof
}

function main() {
    console.log("* * * MERKLE TREE * * *")
    let account_1 = "0x00000"
    const tree_1 = makeMerkleTree(1)
    const root_1 = getMerkleTreeRoot(tree_1)
    // Smart contract owner has to set Merkle Tree Root with this `root_1` and `level`
    const proof_1 = getProof(tree_1, account_1)
    console.log(proof_1)
}

main()