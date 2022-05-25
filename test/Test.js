const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')

const {
  BN,
  constants,
  ether,
  expectRevert,
} = require('@openzeppelin/test-helpers')

require('chai')
  .use(require('chai-as-promised'))
  .should()

const chai = require('chai')
const { expect } = require('chai')
// const { assert } = require('chai')
chai.use(require('chai-bignumber')())

const TrillioHeirs = artifacts.require('./TrillioHeirs.sol')

advanceBlock = () => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_mine',
      id: new Date().getTime()
    }, (err, result) => {
      if (err) { return reject(err) }
      const newBlockHash = web3.eth.getBlock('latest').hash

      return resolve(newBlockHash)
    })
  })
}

contract('TrillioHeirs Contract', ([owner, alice_1, bob_2, carol_3, carlos, chad, mallory, ...rest]) => {

  let trillioHeirs
  let tree_1, tree_2, tree_3

  const whitelist_1 = [alice_1]
  for (let i = 7; i < 2006; ++i)
    whitelist_1.push(rest[i])
  const whitelist_2 = [bob_2]
  for (let i = 2006; i < 4005; ++i)
    whitelist_2.push(rest[i])
  const whitelist_3 = [carol_3]
  for (let i = 4005; i < 5004; ++i)
    whitelist_3.push(rest[i])

  const leafNodes_1 = whitelist_1.map(item => keccak256(item))
  tree_1 = new MerkleTree(leafNodes_1, keccak256, { sortPairs: true })
  const leafNodes_2 = whitelist_2.map(item => keccak256(item))
  tree_2 = new MerkleTree(leafNodes_2, keccak256, { sortPairs: true })
  const leafNodes_3 = whitelist_3.map(item => keccak256(item))
  tree_3 = new MerkleTree(leafNodes_3, keccak256, { sortPairs: true })

  const root_1 = tree_1.getHexRoot()
  const root_2 = tree_2.getHexRoot()
  const root_3 = tree_3.getHexRoot()

  beforeEach(async () => {
    trillioHeirs = await TrillioHeirs.new('ZamNft', 'ZAM', 'baseURI/', { gasLimit: 10000000, from: owner })
    await trillioHeirs.setMerkleTree(root_1, 1)
    await trillioHeirs.setMerkleTree(root_2, 2)
    await trillioHeirs.setMerkleTree(root_3, 3)
  })

  describe('presale', async () => {
    // it('should get presale mode correct', async () => {
    //   expect(await trillioHeirs.presale.call()).to.equal(true)
    //   await expectRevert(trillioHeirs.setPresale(false, { from: mallory }), 'Ownable: caller is not the owner')
    //   await trillioHeirs.setPresale(false, { from: owner })
    //   expect(await trillioHeirs.presale.call()).to.equal(false)
    //   await expectRevert(trillioHeirs.setPresale(true, { from: owner }), 'TrillioHeirs: presale can be set only once')
    // })

    // it('should get paused correct', async () => {
    //   expect(await trillioHeirs.paused.call()).to.equal(false)
    //   await expectRevert(trillioHeirs.setPaused(true, { from: mallory }), 'Ownable: caller is not the owner')
    //   await trillioHeirs.setPaused(true, { from: owner })
    //   expect(await trillioHeirs.presale.call()).to.equal(true)
    // })    

    // it('should not mint cause wrong amount', async () => {
    //   const proof = tree_1.getHexProof(keccak256(whitelist_1[0]))
    //   const wrongProof = tree_1.getHexProof(keccak256(whitelist_1[1]))
    //   await expectRevert(trillioHeirs.presaleMint(11, 1, proof, { from: alice_1, value: web3.utils.toWei('0.15', 'ether') }), 'TrillioHeirs: You have already minted max NFTs or you are going to mint too many NFTs now')
    //   await expectRevert(trillioHeirs.presaleMint(1, 4, proof, { from: alice_1, value: web3.utils.toWei('0.15', 'ether') }), 'TrillioHeirs: Only whitelisted wallet can attend in presale')
    //   await expectRevert(trillioHeirs.presaleMint(1, 1, wrongProof, { from: alice_1, value: web3.utils.toWei('0.15', 'ether') }), 'TrillioHeirs: Only whitelisted wallet can attend in presale')
    //   await expectRevert(trillioHeirs.presaleMint(1, 1, proof, { from: bob_2, value: web3.utils.toWei('0.15', 'ether') }), 'TrillioHeirs: Only whitelisted wallet can attend in presale')
    //   await expectRevert(trillioHeirs.presaleMint(1, 1, proof, { from: alice_1, value: web3.utils.toWei('0.14', 'ether') }), 'TrillioHeirs: Msg.value is less than the real value')
    //   await expectRevert(trillioHeirs.presaleMint(1, 1, proof, { from: alice_1, value: web3.utils.toWei('0.24', 'ether') }), 'TrillioHeirs: Msg.value is less than the real value')
    //   await trillioHeirs.presaleMint(10, 1, proof, { from: alice_1, value: web3.utils.toWei('1.5', 'ether') })
    //   await expectRevert(trillioHeirs.presaleMint(1, 1, proof, { from: alice_1, value: web3.utils.toWei('0.15', 'ether') }), 'TrillioHeirs: You have already minted max NFTs or you are going to mint too many NFTs now')
    // })

    // it('should not mint cause max presale mint count reached', async () => {
    //   for (const [index, item] of whitelist_1.entries()) {
    //     if (index >= 300)
    //       break
    //     await trillioHeirs.presaleMint(10, 1, tree_1.getHexProof(keccak256(item)), { from: item, value: web3.utils.toWei('1.5', 'ether') })
    //   }

    //   expect((await trillioHeirs.mintedAmount_1.call()).toString()).to.eql(new BN('3000').toString())

    //   const proof = tree_2.getHexProof(keccak256(whitelist_2[0]))
    //   await expectRevert(trillioHeirs.presaleMint(1, 2, proof, { from: bob_2, value: web3.utils.toWei('0.15', 'ether') }), 'TrillioHeirs: In presale, Only 3000 NFTs can be mint')
    // }).timeout(5000000)

    // it('should not mint cause max level 2 count exceeded', async () => {
    //   for (const [index, item] of whitelist_2.entries()) {
    //     if (index >= 150)
    //       break
    //     await trillioHeirs.presaleMint(10, 2, tree_2.getHexProof(keccak256(item)), { from: item, value: web3.utils.toWei('1.5', 'ether') })
    //   }

    //   expect((await trillioHeirs.mintedAmount_2.call()).toString()).to.eql(new BN('1500').toString())

    //   const proof = tree_2.getHexProof(keccak256(whitelist_2[160]))
    //   await expectRevert(trillioHeirs.presaleMint(1, 2, proof, { from: whitelist_2[160], value: web3.utils.toWei('0.15', 'ether') }), 'TrillioHeirs: Mint amount can not be greater than remaining NFT amount in each level')
    // }).timeout(5000000)

    // it('should not mint cause max level 3 count exceeded', async () => {
    //   for (const [index, item] of whitelist_3.entries()) {
    //     if (index >= 37)
    //       break
    //     await trillioHeirs.presaleMint(10, 3, tree_3.getHexProof(keccak256(item)), { from: item, value: web3.utils.toWei('1.5', 'ether') })
    //   }

    //   expect((await trillioHeirs.mintedAmount_3.call()).toString()).to.eql(new BN('370').toString())

    //   const proof = tree_3.getHexProof(keccak256(whitelist_3[160]))
    //   await expectRevert(trillioHeirs.presaleMint(1, 3, proof, { from: whitelist_3[160], value: web3.utils.toWei('0.15', 'ether') }), 'TrillioHeirs: Mint amount can not be greater than remaining NFT amount in each level')
    // }).timeout(5000000)
  })

  // describe('public sale', async () => {
  //   it('should not mint cause presale enabled', async () => {
  //     expect(await trillioHeirs.presale.call()).to.equal(true)
  //     await expectRevert(trillioHeirs.publicsaleMint(1, { from: alice_1, value: web3.utils.toWei('0.18', 'ether') }), 'TrillioHeirs: public sale not started')
  //   })

  //   it('should not mint cause wrong amount', async () => {
  //     const proof = tree_1.getHexProof(keccak256(whitelist_1[0]))
  //     await trillioHeirs.presaleMint(4, 1, proof, { from: alice_1, value: web3.utils.toWei('0.6', 'ether') })
  //     await trillioHeirs.setPresale(false, { from: owner })

  //     await expectRevert(trillioHeirs.presaleMint(1, 1, proof, { from: alice_1, value: web3.utils.toWei('0.15', 'ether') }), 'TrillioHeirs: presale finished')

  //     await expectRevert(trillioHeirs.publicsaleMint(1, { from: alice_1, value: web3.utils.toWei('0.14', 'ether') }), 'TrillioHeirs: Msg.value is not enough')
  //     await expectRevert(trillioHeirs.publicsaleMint(1, { from: alice_1, value: web3.utils.toWei('0.24', 'ether') }), 'TrillioHeirs: Msg.value is not enough')
  //     await trillioHeirs.publicsaleMint(1, { from: alice_1, value: web3.utils.toWei('0.18', 'ether') })
  //     await expectRevert(trillioHeirs.publicsaleMint(1, { from: alice_1, value: web3.utils.toWei('0.18', 'ether') }), 'TrillioHeirs: You have already minted max NFTs or you are going to mint too many NFTs now')
  //   })

  //   it('should mint random level nft', async () => {
  //     await trillioHeirs.setPresale(false, { from: owner })
  //     const res = await trillioHeirs.publicsaleMint(5, { from: alice_1, value: web3.utils.toWei('0.9', 'ether') })
      
  //     const lvl1 = [], lvl2 = [], lvl3 = []
  //     for (const e of res.logs) {
  //       expect(e.event).to.equal('Transfer')
  //       const tokenId = e.args.tokenId.toNumber()
  //       if (tokenId < 7000)
  //         lvl1.push(tokenId)
  //       else if (tokenId >= 7000 && tokenId < 8500)
  //         lvl2.push(tokenId)
  //       else if (tokenId >= 8500)
  //         lvl3.push(tokenId)
  //     }

  //     expect(lvl1.length > 0 && (lvl2.length > 0 || lvl3.length > 0)).to.equal(true)
  //   })
  // })

  describe('special list', async () => {
    // it('should add to special list', async () => {
    //   await trillioHeirs.setPresale(false, { from: owner })
    //   await trillioHeirs.addToSpecialList([chad], [3], [1], { from: owner })
    //   const tx = await trillioHeirs.specialMint(1, { from: chad })
    //   const tokenId = tx.logs[0].args.tokenId
    //   expect(await trillioHeirs.ownerOf(tokenId)).to.equal(chad)
    //   await expectRevert(trillioHeirs.specialMint(1, { from: chad }), 'Trillioheirs: Amount can not be greater than max mint amount')
    // })
  })

  describe('owner', async () => {
    // it('should mint 4 lvl', async () => {
    //   await trillioHeirs.ownerLvl4Mint({ from: owner })
    //   expect((await trillioHeirs.mintedAmount_4.call()).toString()).to.eql(new BN('18').toString())
    //   await expectRevert(trillioHeirs.ownerLvl4Mint({ from: owner }), 'TrillioHeirs: level 4 already minted')
    // })

    // it('should be able to withdraw eth', async () => {
    //   const proof = tree_1.getHexProof(keccak256(whitelist_1[0]))
    //   await trillioHeirs.presaleMint(10, 1, proof, { from: alice_1, value: web3.utils.toWei('1.5', 'ether') })
    //   const bo1 = await web3.eth.getBalance(owner)
    //   const b1 = await web3.eth.getBalance(trillioHeirs.address)
    //   await expectRevert(trillioHeirs.withdrawAll({ from: alice_1 }), 'Ownable: caller is not the owner')
    //   await trillioHeirs.withdrawAll({ from: owner })
    //   const bo2 = await web3.eth.getBalance(owner)
    //   const b2 = await web3.eth.getBalance(trillioHeirs.address)
    //   expect(b1.toString()).to.eql(ether('1.5').toString())
    //   expect(b2.toString()).to.eql(ether('0').toString())
    // })
  })

  describe('all counts', async () => {
    it('should mint 8888 only', async () => {
      const events = []
      
      for (const [index, item] of whitelist_1.entries()) {
        if (index >= 180)
          break
        const tx = await trillioHeirs.presaleMint(10, 1, tree_1.getHexProof(keccak256(item)), { from: item, value: web3.utils.toWei('1.5', 'ether') })
        for (const e of tx.logs)
          events.push(e.args.tokenId.toNumber())
      }
      expect((await trillioHeirs.mintedAmount_1.call()).toString()).to.eql(new BN('1800').toString())

      for (const [index, item] of whitelist_2.entries()) {
        if (index >= 100)
          break
        const tx = await trillioHeirs.presaleMint(10, 2, tree_2.getHexProof(keccak256(item)), { from: item, value: web3.utils.toWei('1.5', 'ether') })
        for (const e of tx.logs)
          events.push(e.args.tokenId.toNumber())
      }
      expect((await trillioHeirs.mintedAmount_2.call()).toString()).to.eql(new BN('1000').toString())

      for (const [index, item] of whitelist_3.entries()) {
        if (index >= 20)
          break
        const tx = await trillioHeirs.presaleMint(10, 3, tree_3.getHexProof(keccak256(item)), { from: item, value: web3.utils.toWei('1.5', 'ether') })
        for (const e of tx.logs)
          events.push(e.args.tokenId.toNumber())
      }
      expect((await trillioHeirs.mintedAmount_3.call()).toString()).to.eql(new BN('200').toString())

      const txLvl4 = await trillioHeirs.ownerLvl4Mint({ from: owner })
      for (const e of txLvl4.logs)
        events.push(e.args.tokenId.toNumber())
      expect((await trillioHeirs.mintedAmount_4.call()).toString()).to.eql(new BN('18').toString())

      await expectRevert(trillioHeirs.presaleMint(1, 1, tree_1.getHexProof(keccak256(alice_1)), { from: alice_1, value: web3.utils.toWei('0.15', 'ether') }), 'TrillioHeirs: You have already minted max NFTs or you are going to mint too many NFTs now')

      await trillioHeirs.setPresale(false, { from: owner })
      
      await trillioHeirs.addToSpecialList([chad], [1], [188], { from: owner })
      const txSpecial = await trillioHeirs.specialMint(188, { from: chad })
      for (const e of txSpecial.logs)
        events.push(e.args.tokenId.toNumber())

      for (const [index, item] of whitelist_1.entries()) {
        console.log(index);
        if (index < 180)
          continue
        if (index >= 1317)
          break
        let tx; 
        if (index == 1316)
          tx = await trillioHeirs.publicsaleMint(2, { from: item, value: web3.utils.toWei('0.36', 'ether') })
        else
          tx = await trillioHeirs.publicsaleMint(5, { from: item, value: web3.utils.toWei('0.9', 'ether') })
        for (const e of tx.logs)
          events.push(e.args.tokenId.toNumber())
      }
      expect((await trillioHeirs.mintedAmount_1.call()).toString()).to.eql(new BN('7000').toString())
      expect((await trillioHeirs.mintedAmount_2.call()).toString()).to.eql(new BN('1500').toString())
      expect((await trillioHeirs.mintedAmount_3.call()).toString()).to.eql(new BN('370').toString())
      expect((await trillioHeirs.mintedAmount_4.call()).toString()).to.eql(new BN('18').toString())

      events.sort(function(a, b) {
        return a - b
      })

      for (const tokenId of events)
        console.log(tokenId)

      await expectRevert(trillioHeirs.publicsaleMint(1, { from: bob_2, value: web3.utils.toWei('0.18', 'ether') }), 'TrillioHeirs: Amount of remaining NFT for each level is not enough')
    }).timeout(5000000)
  })
})
