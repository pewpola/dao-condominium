import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Condominium", function () {

  enum Options {
    EMPTY = 0,
    YES = 1,
    NO = 2,
    ABSTENTION = 3
  }

  async function deployFixture() {
    const [manager, resident] = await hre.ethers.getSigners();

    const Condominium = await hre.ethers.getContractFactory("Condominium");
    const contract = await Condominium.deploy();

    return { contract, manager, resident };
  }

  it("Should be a residence", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    expect(await contract.residenceExists(2102)).to.equal(true);
  });

  it("Should add a resident", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    await contract.addResident(resident.address, 2102);

    expect(await contract.isResident(resident.address)).to.equal(true);
  });

  it("Should NOT add a resident (permission)", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    const instance = contract.connect(resident);
    
    await expect(instance.addResident(resident.address, 2102))
    .to.be.revertedWith("Only the manager or the council can do this");
  });

  it("Should NOT add a resident (residence does not exist)", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    await expect(contract.addResident(resident.address, 3000))
    .to.be.revertedWith("This residence does not exist");
  });

  it("Should remove a resident", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    await contract.addResident(resident.address, 2102);
    await contract.removeResident(resident.address);

    expect(await contract.isResident(resident.address)).to.equal(false);
  });

  it("Should NOT remove a resident (permission)", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    const instance = contract.connect(resident);
    await contract.addResident(resident.address, 2102);

    await expect(instance.removeResident(resident.address))
    .to.be.revertedWith("Only the manager can do this");
  });

  it("Should NOT remove a resident (counselor cannot be removed)", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    await contract.addResident(resident.address, 2102);
    await contract.setCounselor(resident.address, true);

    await expect(contract.removeResident(resident.address))
    .to.be.revertedWith("A counselor cannot be removed");
  });

  it("Should set counselor", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    await contract.addResident(resident.address, 2102);
    await contract.setCounselor(resident.address, true);

    expect(await contract.counselors(resident.address)).to.equal(true);
  });

  it("Should NOT set counselor (permission)", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    const instance = contract.connect(resident);
    await contract.addResident(resident.address, 2102);

    await expect(instance.setCounselor(resident.address, true))
    .to.be.revertedWith("Only the manager can do this");
  });

  it("Should NOT set counselor (not a resident)", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    await expect(contract.setCounselor(resident.address, true))
    .to.be.revertedWith("The counselor must be a resident");
  });

  it("Should set counselor (leaving)", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    await contract.addResident(resident.address, 2102);
    await contract.setCounselor(resident.address, true);
    await contract.setCounselor(resident.address, false);

    expect(await contract.counselors(resident.address)).to.equal(false);
  });

  it("Should set manager", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    await contract.setManager(resident.address);

    expect(await contract.manager()).to.equal(resident.address);
  });

  it("Should NOT set manager (permission)", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    const instance = contract.connect(resident);

    await expect(instance.setManager(resident.address))
    .to.be.revertedWith("Only the manager can do this");
  });

  it("Should NOT set manager (invalid address)", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    await expect(contract.setManager("0x0000000000000000000000000000000000000000"))
    .to.be.revertedWith("The address must be valid");
  });

  it("Should add topic", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    await contract.addResident(resident.address, 1202);

    const instance = contract.connect(resident);
    await instance.addTopic("test", "test test");

    expect(await contract.topicExists("test")).to.equal(true);
  });

  it("Should NOT add topic (permission)", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    await contract.addResident(resident.address, 1202);
    await contract.setCounselor(resident.address, true);

    const instance = contract.connect(resident);

    expect(await instance.addTopic("test","test test"))
    .to.be.revertedWith("Only the manager or the residents can do this");
  });

  it("Should NOT add topic (already exists)", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    await contract.addResident(resident.address, 1202);

    const instance = contract.connect(resident);
    await instance.addTopic("test", "test test");

    await expect(instance.addTopic("test", "test test"))
    .to.be.revertedWith("This topic already exists");
  });

  it("Should remove topic", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    await contract.addResident(resident.address, 1202);
    await contract.setManager(resident.address);

    const instance = contract.connect(resident);
    await instance.addTopic("test", "test test");

    await instance.removeTopic("test");

    expect(await contract.topicExists("test")).to.equal(false);
  });

  it("Should NOT remove topic (permission)", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    await contract.addResident(resident.address, 1202);

    const residentInstance = contract.connect(resident);
    await residentInstance.addTopic("test", "test test");

    await contract.setCounselor(resident.address, true);

    const counselorInstance = contract.connect(resident);

    await expect(residentInstance.removeTopic("test"))
    .to.be.revertedWith("Only the manager can do this");
    await expect(counselorInstance.removeTopic("test"))
    .to.be.revertedWith("Only the manager can do this");
  });

  it("Should NOT remove topic (not a idle topic)", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    await contract.addTopic("test", "test test");
    await contract.openVoting("test");
    
    await expect(contract.removeTopic("test"))
    .to.be.revertedWith("Only IDLE topics can be removed");
  });

  it("Should vote", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    await contract.addResident(resident.address, 1202);

    const instance = contract.connect(resident);
    await instance.addTopic("topic", "description");
    
    await contract.openVoting("topic");

    await instance.vote("topic", Options.YES);

    expect(await contract.votesCounter("topic")).to.equal(1);
  });

  it("Should NOT vote (empty choice)", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    await contract.addResident(resident.address, 1202);

    const instance = contract.connect(resident);
    await instance.addTopic("topic", "description");
    
    await contract.openVoting("topic");

    await expect(instance.vote("topic", Options.EMPTY))
    .to.be.revertedWith("The option cannot be EMPTY");
  });

  it("Should NOT vote (topic does not exist)", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    await contract.addResident(resident.address, 1202);

    const instance = contract.connect(resident);
    
    await expect(instance.vote("topic", Options.YES))
    .to.be.revertedWith("The topic does not exist");
  });

  it("Should NOT vote (not opened for voting)", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    await contract.addResident(resident.address, 1202);

    const instance = contract.connect(resident);
    await instance.addTopic("topic", "description");
    
    await expect(instance.vote("topic", Options.YES))
    .to.be.revertedWith("Only VOTING topics can be voted");
  });

  it("Should NOT vote twice (already voted)", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    await contract.addResident(resident.address, 1202);

    const instance = contract.connect(resident);
    await instance.addTopic("topic", "description");

    await contract.openVoting("topic");
  
    await instance.vote("topic", Options.NO);

    await expect(instance.vote("topic", Options.YES))
    .to.be.revertedWith("A residence should vote only once");
  });

  it("Should NOT vote (permission)", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);
    
    const instance = contract.connect(resident);
    
    await contract.addTopic("topic", "description");

    await contract.openVoting("topic");
  
    await expect(instance.vote("topic", Options.YES))
    .to.be.revertedWith("Only the manager or the residents can do this");
  });

});
