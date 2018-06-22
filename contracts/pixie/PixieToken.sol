pragma solidity ^0.4.24;


import 'openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import 'openzeppelin-solidity/contracts/ownership/Whitelist.sol';
import 'openzeppelin-solidity/contracts/ownership/HasNoEther.sol';


contract PixieToken is StandardToken, Whitelist, HasNoEther {

  string public constant name = "Pixie Token";

  string public constant symbol = "PXE";

  uint8 public constant decimals = 18;

  uint256 public constant initialSupply = 100000000000 * (10 ** uint256(decimals)); // 100 Billion PXE ^ decimal

  bool public transfersEnabled = false;

  address public bridge;

  event BridgeChange(address to);

  event TransfersEnabledChange(bool to);

  /**
   * @dev Constructor that gives msg.sender all of existing tokens.
   */
  constructor() public Whitelist() {
    totalSupply_ = initialSupply;
    balances[msg.sender] = initialSupply;
    emit Transfer(0x0, msg.sender, initialSupply);

    // transfer bridge set to msg sender
    bridge = msg.sender;

    // owner is automatically whitelisted
    addAddressToWhitelist(msg.sender);
  }

  function transfer(address _to, uint256 _value) public returns (bool) {
    require(
      transfersEnabled || whitelist(msg.sender) || _to == bridge,
      "Unable to transfers locked or address not whitelisted or not sending to the bridge"
    );

    return super.transfer(_to, _value);
  }

  function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
    require(
      transfersEnabled || whitelist(msg.sender) || _to == bridge,
      "Unable to transfers locked or address not whitelisted or not sending to the bridge"
    );

    return super.transferFrom(_from, _to, _value);
  }

  /**
   * @dev Allows for setting the bridge address
   * @dev Must be called by owner
   *
   * @param _new the address to set
   */
  function changeBridge(address _new) external onlyOwner {
    require(_new != address(0), "Invalid address");
    bridge = _new;
    emit BridgeChange(bridge);
  }

  /**
   * @dev Allows for setting transfer on/off - used as hard stop
   * @dev Must be called by owner
   *
   * @param _transfersEnabled the value to set
   */
  function setTransfersEnabled(bool _transfersEnabled) external onlyOwner {
    transfersEnabled = _transfersEnabled;
    emit TransfersEnabledChange(transfersEnabled);
  }
}
