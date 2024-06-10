import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CondominiumModule = buildModule("CondominiumModule", (m) => {
  const condominium = m.contract("Condominium");

  return { condominium };
});

export default CondominiumModule;
