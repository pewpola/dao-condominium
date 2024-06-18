import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Condominium", function () {
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

});
