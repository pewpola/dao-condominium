import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("CondominiumAdapter", function () {

  enum Options {
    EMPTY = 0,
    YES = 1,
    NO = 2,
    ABSTENTION = 3
  }

  enum Status {
    IDLE = 0,
    VOTING = 1,
    APPROVED = 2,
    DENIED = 3
  }

  async function deployAdapterFixture() {
    const accounts = await hre.ethers.getSigners();
    const manager = accounts[0];

    const CondominiumAdapter = await hre.ethers.getContractFactory("CondominiumAdapter");
    const adapter = await CondominiumAdapter.deploy();

    return { adapter, manager, accounts };
  }

  async function deployImplementationFixture() {
    const Condominium = await hre.ethers.getContractFactory("Condominium");
    const contract = await Condominium.deploy();

    return { contract };
  }

  it("Should upgrade", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    const { contract } = await loadFixture(deployImplementationFixture);

    const contractAddress = await contract.getAddress();
    await adapter.upgrade(contractAddress);
    const address = await adapter.getImplementationAddress();

    expect(address).to.equal(contractAddress);
  });

  it("Should NOT upgrade (permission)", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    const { contract } = await loadFixture(deployImplementationFixture);

    const contractAddress = await contract.getAddress();
    const instance = adapter.connect(accounts[1]);

    await expect(instance.upgrade(contractAddress))
    .to.be.revertedWith("You do not have permission");
  });

  it("Should add resident", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    const { contract } = await loadFixture(deployImplementationFixture);

    const contractAddress = await contract.getAddress();
    await adapter.upgrade(contractAddress);
    await adapter.addResident(accounts[1].address, 1301);

    expect(await contract.isResident(accounts[1].address)).to.equal(true);
  });

  it("Should remove resident", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    const { contract } = await loadFixture(deployImplementationFixture);

    const contractAddress = await contract.getAddress();
    await adapter.upgrade(contractAddress);
    await adapter.addResident(accounts[1].address, 1301);
    await adapter.removeResident(accounts[1].address);

    expect(await contract.isResident(accounts[1].address)).to.equal(false);
  });

  it("Should set counselor", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    const { contract } = await loadFixture(deployImplementationFixture);

    const contractAddress = await contract.getAddress();
    await adapter.upgrade(contractAddress);
    await adapter.addResident(accounts[1].address, 1301);
    await adapter.setCounselor(accounts[1].address, true);

    expect(await contract.counselors(accounts[1].address)).to.equal(true);
  });

  it("Should set manager", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    const { contract } = await loadFixture(deployImplementationFixture);

    const contractAddress = await contract.getAddress();
    await adapter.upgrade(contractAddress);
    await adapter.addResident(accounts[1].address, 1301);
    await adapter.setManager(accounts[1].address);

    expect(await contract.manager()).to.equal(accounts[1].address);
  });

  it("Should add topic", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    const { contract } = await loadFixture(deployImplementationFixture);

    const contractAddress = await contract.getAddress();
    await adapter.upgrade(contractAddress);
    await adapter.addTopic("topic", "description");

    expect(await contract.topicExists("topic")).to.equal(true);
  });

  it("Should remove topic", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    const { contract } = await loadFixture(deployImplementationFixture);

    const contractAddress = await contract.getAddress();
    await adapter.upgrade(contractAddress);
    await adapter.addTopic("topic", "description");
    await adapter.removeTopic("topic");

    expect(await contract.topicExists("topic")).to.equal(false);
  });

  it("Should open voting", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    const { contract } = await loadFixture(deployImplementationFixture);

    const contractAddress = await contract.getAddress();
    await adapter.upgrade(contractAddress);
    await adapter.addTopic("topic", "description");
    await adapter.openVoting("topic");
    
    const topic = await contract.getTopic("topic");

    expect(topic.status).to.equal(Status.VOTING);
  });

  it("Should vote", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    const { contract } = await loadFixture(deployImplementationFixture);

    const contractAddress = await contract.getAddress();
    await adapter.upgrade(contractAddress);
    await adapter.addTopic("topic", "description");
    await adapter.openVoting("topic");
    await adapter.vote("topic", Options.YES);
    
    expect(await contract.votesCounter("topic")).to.equal(1);
  });

  it("Should close voting", async function () {
    const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
    const { contract } = await loadFixture(deployImplementationFixture);

    const contractAddress = await contract.getAddress();
    await adapter.upgrade(contractAddress);
    await adapter.addTopic("topic", "description");
    await adapter.openVoting("topic");
    await adapter.vote("topic", Options.YES);
    await adapter.closeVoting("topic");
    
    const topic = await contract.getTopic("topic");

    expect(topic.status).to.equal(Status.APPROVED);
  });

});
