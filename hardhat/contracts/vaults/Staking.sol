// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./Balances.sol";
import "./LoanPoolBalances.sol";
import "../tokens/PoolTokens.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Staking
 * @dev A contract for staking and unstaking tokens in a loan pool.
 */
contract Staking is Balances, LoanPoolBalances {
    address public poolToken;
    mapping(address => uint) public ammPoolToTokenId;
    mapping(address => bool) public isFrozen;



    modifier IfIsFrozen(address _ammPool) {
        require(!isFrozen[_ammPool], "Pool is frozen");
        _;
    }
    constructor(address _usdc, address _poolTokens) Balances(_usdc) {
        poolToken = _poolTokens;
    }
 /**
     * @dev Function for staking usdc in the loan pool.
     * @param _amount The amount of usdc to stake.
     * @param _ammPool The address of the AMM pool.
     */
    function stake(uint _amount, address _ammPool) public {
        require(availableBalance[msg.sender] >= _amount, "not enough balance");
        availableBalance[msg.sender] -= _amount;
        uint _denominator = poolTotalUsdcSupply[_ammPool]>0?poolTotalUsdcSupply[_ammPool]:1;
        uint _porportion = (_amount * 1e18) / _denominator;
        require(
            PoolTokens(poolToken).stakeMint(
                msg.sender,
                ammPoolToTokenId[_ammPool],
                _porportion
            ),
            "stake mint failed"
        );
        poolTotalUsdcSupply[_ammPool] += _amount;
        poolAvailableUsdc[_ammPool] += _amount;
        //event stake(address _user,uint _amount,uint _porportion);
    }

 /**
     * @dev Function for unstaking tokens from the loan pool.
     * @param _amountToBurn The amount of tokens to unstake (burn).
     * @param _ammPool The address of the AMM pool.
     */
    function unStake(uint _amountToBurn, address _ammPool) public IfIsFrozen(_ammPool) {
        PoolTokens poolTokCon = PoolTokens(poolToken);
        require(
            _amountToBurn <=
                poolTokCon.balanceOf(msg.sender, ammPoolToTokenId[_ammPool]),
            "Not enough tokens to burn"
        );
        uint _tokenSupply = poolTokCon.totalSupplyTok(
            ammPoolToTokenId[_ammPool]
        );
        uint _porportion = (_amountToBurn * 1e18) / _tokenSupply;
        uint _amount = (poolTotalUsdcSupply[_ammPool] * _porportion) / 1e18;
        require(
            _amount <= poolAvailableUsdc[_ammPool],
            "Not enough usdc aviailable"
        );
        require(
            poolTokCon.burn(msg.sender, ammPoolToTokenId[_ammPool], _amount),
            "stake burn failed"
        );

        poolAvailableUsdc[_ammPool] -= _amount;
        poolTotalUsdcSupply[_ammPool] -= _amount;
        availableBalance[msg.sender] += _amount;
        //event unstake(address _user,uint _amount,uint _porportion);
    }


   /**
     * @dev Function for adding an AMM token to the poolTokens contract .
     * @param _ammPool The address of the AMM pool.
     * @param _id The ID of the token in the pool.
     */
    function addAmmTokenToPool(address _ammPool,uint _id) public {
        require(
            ammPoolToTokenId[_ammPool] == _id,
            "Pool already added to staking"
        );
        ammPoolToTokenId[_ammPool] = _id;
    }
}
