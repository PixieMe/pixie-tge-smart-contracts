pragma solidity ^0.4.24;

import "./PixieToken.sol";
import "openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/crowdsale/distribution/utils/RefundVault.sol";

contract PixieCrowdsale is Crowdsale, Pausable {

  event Finalized();

  event MinimumContributionUpdated(uint256 _minimumContribution);

  event ManagementTransfer(address indexed caller, address indexed beneficiary, uint256 amount);

  mapping(address => bool) public whitelist;

  mapping(address => bool) public managementWhitelist;

  mapping(address => uint256) public contributions;

  bool public isFinalized = false;

  // Tuesday, July 3, 2018 10:00:00 AM GMT+01:00
  uint256 public openingTime = 1530608400;

  // Wednesday, August 1, 2018 9:59:59 AM GMT+01:00
  uint256 public privateSaleCloseTime = 1533113999;

  // Monday, October 1, 2018 9:59:59 AM GMT+01:00
  uint256 public preSaleCloseTime = 1538384399;

  // Wednesday, October 31, 2018 9:59:59 AM GMT+00:00
  uint256 public closingTime = 1540979999;

  // price per token (no discount)
  uint256 public rate = 396039;

  // 22.5% discount
  uint256 public privateSaleRate = 485148;

  // 12.5% discount
  uint256 public preSaleRate = 445544;

  uint256 public softCap = 2650 ether;

  uint256 public hardCap = 101000 ether;

  uint256 public minimumContribution = 1 ether;

  // refund vault used to hold funds while crowdsale is running
  RefundVault public vault;

  /**
  * @dev Throws if called by any account other than the owner or the someone in the management list.
  */
  modifier onlyManagement() {
    require(msg.sender == owner || managementWhitelist[msg.sender], "Must be owner or in management whitelist");
    _;
  }

  /**
   * @dev Constructs the Crowdsale contract with pre-defined parameter plus params
   *
   * @param _wallet Address where collected funds will be forwarded to
   * @param _token Address of the token being sold
   */
  constructor(address _wallet, PixieToken _token) public Crowdsale(rate, _wallet, _token) {
    vault = new RefundVault(wallet);
  }

  /**
   * @dev Checks whether funding goal was reached.
   * @return Whether funding goal was reached
   */
  function softCapReached() public view returns (bool) {
    return weiRaised >= softCap;
  }

  /**
   * @dev vault finalization task, called when owner calls finalize()
   */
  function finalization() internal {
    if (softCapReached()) {
      vault.close();
    } else {
      vault.enableRefunds();
    }
  }

  /**
   * @dev Overrides Crowdsale fund forwarding, sending funds to vault if not finalised, otherwise to wallet
   */
  function _forwardFunds() internal {
    // once finalized all contributions got to the wallet
    if (isFinalized) {
      wallet.transfer(msg.value);
    }
    // otherwise send to vault to allow refunds, if required
    else {
      vault.deposit.value(msg.value)(msg.sender);
    }
  }

  /**
   * @dev Must be called after crowdsale ends, to do some extra finalization
   * work. Calls the contract's finalization function.
   */
  function finalize() onlyOwner public {
    require(!isFinalized, "Crowdsale already finalised");

    finalization();
    emit Finalized();

    isFinalized = true;
  }

  /**
   * @dev Adds single address to whitelist.
   * @param _beneficiary Address to be added to the whitelist
   */
  function addToWhitelist(address _beneficiary) external onlyManagement {
    whitelist[_beneficiary] = true;
  }

  /**
   * @dev Adds list of addresses to whitelist. Not overloaded due to limitations with truffle testing.
   * @param _beneficiaries Addresses to be added to the whitelist
   */
  function addManyToWhitelist(address[] _beneficiaries) external onlyManagement {
    for (uint256 i = 0; i < _beneficiaries.length; i++) {
      whitelist[_beneficiaries[i]] = true;
    }
  }

  /**
   * @dev Removes single address from whitelist.
   * @param _beneficiary Address to be removed to the whitelist
   */
  function removeFromWhitelist(address _beneficiary) external onlyManagement {
    whitelist[_beneficiary] = false;
  }

  /**
   * @dev Adds single address to the management whitelist.
   * @param _manager Address to be added to the management whitelist
   */
  function addToManagementWhitelist(address _manager) external onlyManagement {
    managementWhitelist[_manager] = true;
  }

  /**
   * @dev Removes single address from the management whitelist.
   * @param _manager Address to be removed to the management whitelist
   */
  function removeFromManagementWhitelist(address _manager) external onlyManagement {
    managementWhitelist[_manager] = false;
  }

  /**
   * @dev Allows for updating the opening time in the event of a delay
   * @dev Must be called by management, use sparingly as no restrictions are set
   *
   * @param _openingTime the epoch time to set
   */
  function updateOpeningTime(uint256 _openingTime) external onlyManagement {
    require(_openingTime > 0, "A opening time must be specified");
    openingTime = _openingTime;
  }

  /**
   * @dev Allows for updating the private sale close time in the event of a delay
   * @dev Must be called by management, use sparingly as no restrictions are set
   *
   * @param _privateSaleCloseTime the epoch time to set
   */
  function updatePrivateSaleCloseTime(uint256 _privateSaleCloseTime) external onlyManagement {
    require(_privateSaleCloseTime > 0, "A private sale time must be specified");
    privateSaleCloseTime = _privateSaleCloseTime;
  }

  /**
   * @dev Allows for updating the pre sale close time in the event of a delay
   * @dev Must be called by management, use sparingly as no restrictions are set
   *
   * @param _preSaleCloseTime the epoch time to set
   */
  function updatePreSaleCloseTime(uint256 _preSaleCloseTime) external onlyManagement {
    require(_preSaleCloseTime > 0, "A pre sale time must be specified");
    preSaleCloseTime = _preSaleCloseTime;
  }

  /**
   * @dev Allows for updating the pre sale close time in the event of a delay
   * @dev Must be called by management, use sparingly as no restrictions are set
   *
   * @param _closingTime the epoch time to set
   */
  function updateClosingTime(uint256 _closingTime) external onlyManagement {
    require(_closingTime > 0, "A closing time must be specified");
    closingTime = _closingTime;
  }

  /**
   * @dev Allows for updating the minimum contribution required to participate
   * @dev Must be called by management
   *
   * @param _minimumContribution the minimum contribution to set
   */
  function updateMinimumContribution(uint256 _minimumContribution) external onlyManagement {
    require(_minimumContribution > 0, "Minimum contribution must be great than zero");
    minimumContribution = _minimumContribution;
    emit MinimumContributionUpdated(_minimumContribution);
  }

  /**
   * @dev Utility method for returning a set of epoch dates about the ICO
   */
  function getDateRanges() external view returns (
    uint256 _openingTime,
    uint256 _privateSaleCloseTime,
    uint256 _preSaleCloseTime,
    uint256 _closingTime
  ) {
    return (
    openingTime,
    privateSaleCloseTime,
    preSaleCloseTime,
    closingTime
    );
  }

  /**
   * @dev Extend parent behavior to update user contributions so far
   * @param _beneficiary Token purchaser
   * @param _weiAmount Amount of wei contributed
   */
  function _updatePurchasingState(address _beneficiary, uint256 _weiAmount) internal {
    super._updatePurchasingState(_beneficiary, _weiAmount);
    contributions[_beneficiary] = contributions[_beneficiary].add(_weiAmount);
  }

  /**
   * @dev Checks whether the hard cap has been reached.
   * @return Whether the cap was reached
   */
  function hardCapReached() public view returns (bool) {
    return weiRaised >= hardCap;
  }

  /**
   * @dev Checks whether the period in which the crowdsale is open has already elapsed.
   * @return Whether crowdsale period has elapsed
   */
  function hasClosed() public view returns (bool) {
    return now > closingTime;
  }

  /**
   * @dev Overridden method used to allow different rates for private/pre sale
   * @param _weiAmount Value in wei to be converted into tokens
   * @return Number of tokens that can be purchased with the specified _weiAmount
   */
  function _getTokenAmount(uint256 _weiAmount) internal view returns (uint256) {
    if (now < privateSaleCloseTime) {
      return _weiAmount.mul(privateSaleRate);
    }

    if (now < preSaleCloseTime) {
      return _weiAmount.mul(preSaleRate);
    }

    return _weiAmount.mul(rate);
  }

  /**
   * @dev Checks whether the period in which the crowdsale is open has elapsed.
   * @return true if crowdsale period is open, otherwise false
   */
  function isCrowdsaleOpen() public view returns (bool) {
    return now >= openingTime && now <= closingTime;
  }

  /**
   * @dev Extend parent behavior requiring contract to not be paused.
   * @param _beneficiary Token beneficiary
   * @param _weiAmount Amount of wei contributed
   */
  function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal {
    super._preValidatePurchase(_beneficiary, _weiAmount);

    require(isCrowdsaleOpen(), "Crowdsale not open");

    require(weiRaised.add(_weiAmount) <= hardCap, "Exceeds maximum cap");

    require(_weiAmount >= minimumContribution, "Beneficiary minimum amount not reached");

    require(whitelist[_beneficiary], "Beneficiary not whitelisted");

    require(!paused, "Contract paused");
  }

  /**
   * @dev Allow management to transfer tokens. Will be used to transfer unsold tokens.
   * @param _beneficiary Token beneficiary
   * @param _tokenAmount Amount of tokens to deliver
   */
  function managementTransfer(address _beneficiary, uint256 _tokenAmount) external onlyManagement {
    _deliverTokens(_beneficiary, _tokenAmount);
    emit ManagementTransfer(msg.sender, _beneficiary, _tokenAmount);
  }
}
