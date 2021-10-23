// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/* 
  - check https://eips.ethereum.org/EIPS/eip-20 to see
    why the methods are implemented in a certain way
*/

contract Arlo {
    string public name = "Arlo Token";
    string public symbol = "Arlo";
    /* 1 million tokens */
    uint256 public totalSupply = 1000000000000000000000000;
    uint8 public decimals = 18;

    /*
      - MUST trigger when tokens are transferred, 
        including zero value transfers.
    */
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    /*
      - MUST trigger on any successful call to 
        approve(address _spender, uint256 _value).
    */
    event Approval(
        address indexed _from,
        address indexed _spender,
        uint256 _value
    );

    /* 
      - a dict with the address as the key 
        and the balance as the value 
    */
    mapping(address => uint256) public balanceOf;

    /*
      - record the amount which _spender is still 
        allowed to withdraw from _owner.
      - since we are recording the allowance 
        for multiple owners, and each owner can
        have a list of spenders it need to record
        the allowance of, we need a dict of dict
        data structure
    */
    mapping(address => mapping(address => uint256)) public allowance;

    constructor() {
        /* 
          - allocate the total supply to
            whom who deployed this contract  
        */
        balanceOf[msg.sender] = totalSupply;
    }

    /*
      - Transfers _value amount of tokens to address _to, 
        and MUST fire the Transfer event.
      - SHOULD throw if the message caller’s account balance 
        does not have enough tokens to spend.
    */
    function transfer(address _to, uint256 _value) public returns (bool) {
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    /*
      - allows _spender to withdraw from your account multiple times, 
        up to the _value amount. 
      - if this function is called again it overwrites the current 
        allowance with _value.
   */

    /*
      - msg.sender is the address of account who authorized the _value amount
        that can be withdrawn from the account
      - _spender is the address of the bank who can transfer the money
        on behalf of the msg.sender   
    */

    function approve(address _spender, uint256 _value) public returns (bool) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /*
      - transfers _value amount of tokens from address _from to address _to, 
        and MUST fire the Transfer event.
      - this method is used for a withdraw workflow, 
        allowing contracts to transfer tokens on your behalf. 
        This can be used for example to allow a contract to transfer 
        tokens on your behalf and/or to charge fees in sub-currencies. 
      - SHOULD throw unless the _from account has deliberately 
        authorized the sender of the message via some mechanism.
      - transfers of 0 values MUST be treated as normal transfers 
        and fire the Transfer event.
    */
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool) {
        /* _from has enough tokens */
        require(_value <= balanceOf[_from]);
        /* within the amount the _from has approved the bank to transfer */
        require(
            _value <= allowance[_from][msg.sender],
            "transferred amount greater than allowed amount"
        );
        balanceOf[_to] += _value;
        balanceOf[_from] -= _value;
        /* deduct the transferred amount from the allowance */
        allowance[_from][msg.sender] -= _value;
        return true;
    }
}
