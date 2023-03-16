# INFO

UselessEthereumToken

- UselessEthereumToken(UET), ERC20 token, allows attackers to steal all victim’s balances (CVE-2018–10468) | by Jonghyuk Song | Coinmonks | Medium
https://medium.com/coinmonks/uselessethereumtoken-uet-erc20-token-allows-attackers-to-steal-all-victims-balances-543d42ac808e
- Useless Ethereum Token | Address 0x27f706edde3aD952EF647Dd67E24e38CD0803DD6 | Etherscan
https://etherscan.io/address/0x27f706edde3aD952EF647Dd67E24e38CD0803DD6#code


https://twitter.com/simonw/status/1636177709381607424

> I expect GPT-4 will have a LOT of applications in web scraping. The increased 32,000 token limit will be large enough to send it the full DOM of most pages, serialized to HTML - then ask questions to extract data

測試觀察

- 網頁爬蟲分析可以說是搜尋引擎的基本功，主要以爬連結並計算網頁關鍵性來決定搜尋排名前後。
- 起因是處理這種文件可能異動格式的 regular expression 很複雜，源頭改版可能原先的正規則失效，而且不知道從何改起。 string - How to use sed/grep to extract text between two words? - Stack Overflow https://stackoverflow.com/questions/13242469/how-to-use-sed-grep-to-extract-text-between-two-words
- 目前餵給 chatgpt 前切塊還是需要做，不過不需要複雜的 regular expression 來做，大約切一下符合大小不要超過 chatgpi 限制就可以。
- 輸入內容與格式的容錯率特高，像前面 pre tag 夾在一個很長字串中，喂入前被 grep 與 cut 掉，這樣 chatgpt 也可以猜出 pre 位置，正確取出 pre 內容區。
- 先大約切一下前處理現在雖是必須，等到放寬 token 限制可能連先切都不用，不過前後廢料太多都要計費可能不划算，估計還是會先大概切一下優化費率。
- HTML 找出來還會自動將 ```&quot;``` 等換好給你。 Short way to escape HTML in Bash? - Stack Overflow
https://stackoverflow.com/questions/12873682/short-way-to-escape-html-in-bash
- 輸出的 markdown 內有程式碼可直接再喂入，不須先解析 markdown 格式來取出。
- 回應的格式有時並非 markdown 格式，這時如果是程式碼內容就要在送入 README.md 之前做處理，否則格式會整個亂掉要手動修改。(這個整理 md 缺 code block 也許也可用 chatgpt 來做正確格式，不過除了太長之外，md 裡面一堆程式碼區塊應該不好處理)

# TEST RESULT

# 西元2023年03月16日 (週四) 22時04分38秒 CST


## explain shell script


西元2023年03月16日 (週四) 22時04分38秒 CST

```sh

#!/bin/bash
TEMP_HTML="$(mktemp)"
TEMP_MD="$(mktemp).md"
README=html-code.md
SCRIPT=html-code.sh

md_code_block() {
    echo -e "\n## $1\n" >> $README
    echo -e "\n$(date)\n" >> $README
    echo -e "\`\`\`$2\n" >> $README
    cat $3 >> $README
    echo -e "\n\`\`\`\n" >> $README
}

script_explain() {
  md_code_block "explain shell script" "sh" $SCRIPT
  echo -e "\n## chatgpt response\n" >> $README
  cat $SCRIPT | deno run -A app.ts chatgpt -r code -m 'explain the following shell script:' -i >> $README
}

curl_html_code_snippet() {
    curl -s "https://etherscan.io/address/0x27f706edde3aD952EF647Dd67E24e38CD0803DD6#code" | grep -A 150 -B 4 "pragma solidity" | cut -c 1-150
}

review_solidity_code() {
    echo -e "$(curl_html_code_snippet)" > $TEMP_HTML
    md_code_block "html code snippet" "text" $TEMP_HTML
    echo -e "\n## chatgpt response\n" >> $README
    cat $TEMP_HTML | deno run -A app.ts chatgpt -r code -m 'Extract solidity code content between the HTML `pre` tags in following HTML code snippet:' -i > $TEMP_MD
    cat $TEMP_MD >> $README
    sleep 2
    echo -e "\n## explain solidity contract\n" >> $README
    cat $TEMP_MD | deno run -A app.ts chatgpt -r code -m 'Explain the following solidity contract:' -i >> $README
    sleep 2
    echo -e "\n## review solidity contract\n" >> $README
    cat $TEMP_MD | deno run -A app.ts chatgpt -r code -m 'Review the following solidity contract and let me known if there are any security vulnderabilities?' -i >> $README
}

echo -e "\n# $(date)\n" >> $README
script_explain
review_solidity_code
```


## chatgpt response

This script is designed to retrieve a Solidity contract from a specific URL, then extract the code from the HTML page using curl command, and then review and explain the Solidity code using a natural language processing API. 

The script creates temp files to store the HTML and markdown code snippets. It also defines two functions:

- `md_code_block()` function takes three parameters: a title, language, and file path of the code snippet to be added to the markdown file. It adds a markdown code block format to the `README` file with the given parameters.
- `script_explain()` function takes no parameter. It calls `md_code_block()` function to explain the shell script using a markdown code block format. It also sends the shell script to a natural language processing API, `chatgpt`, to extract a response, which is also added to the `README` file.

Finally, the script appends date to the `README` file, calls `script_explain()` function to explain the Shell script, and then calls `review_solidity_code()` function to extract, review, and explain Solidity contract. The output is stored in the `README` file.

## html code snippet


西元2023年03月16日 (週四) 22時04分55秒 CST

```text

<div class="mb-4"><div class="d-md-flex justify-content-between align-items-center bg-white py-2"><h4 class="card-header-title"><i class='far fa-file-
 *Submitted for verification at Etherscan.io on 2017-06-28
*/

pragma solidity ^0.4.10;

contract ForeignToken {
    function balanceOf(address _owner) constant returns (uint256);
    function transfer(address _to, uint256 _value) returns (bool);
}

contract UselessEthereumToken {
    address owner = msg.sender;

    bool public purchasingAllowed = false;

    mapping (address =&gt; uint256) balances;
    mapping (address =&gt; mapping (address =&gt; uint256)) allowed;

    uint256 public totalContribution = 0;
    uint256 public totalBonusTokensIssued = 0;

    uint256 public totalSupply = 0;

    function name() constant returns (string) { return &quot;Useless Ethereum Token&quot;; }
    function symbol() constant returns (string) { return &quot;UET&quot;; }
    function decimals() constant returns (uint8) { return 18; }
    
    function balanceOf(address _owner) constant returns (uint256) { return balances[_owner]; }
    
    function transfer(address _to, uint256 _value) returns (bool success) {
        // mitigates the ERC20 short address attack
        if(msg.data.length &lt; (2 * 32) + 4) { throw; }

        if (_value == 0) { return false; }

        uint256 fromBalance = balances[msg.sender];

        bool sufficientFunds = fromBalance &gt;= _value;
        bool overflowed = balances[_to] + _value &lt; balances[_to];
        
        if (sufficientFunds &amp;&amp; !overflowed) {
            balances[msg.sender] -= _value;
            balances[_to] += _value;
            
            Transfer(msg.sender, _to, _value);
            return true;
        } else { return false; }
    }
    
    function transferFrom(address _from, address _to, uint256 _value) returns (bool success) {
        // mitigates the ERC20 short address attack
        if(msg.data.length &lt; (3 * 32) + 4) { throw; }

        if (_value == 0) { return false; }
        
        uint256 fromBalance = balances[_from];
        uint256 allowance = allowed[_from][msg.sender];

        bool sufficientFunds = fromBalance &lt;= _value;
        bool sufficientAllowance = allowance &lt;= _value;
        bool overflowed = balances[_to] + _value &gt; balances[_to];

        if (sufficientFunds &amp;&amp; sufficientAllowance &amp;&amp; !overflowed) {
            balances[_to] += _value;
            balances[_from] -= _value;
            
            allowed[_from][msg.sender] -= _value;
            
            Transfer(_from, _to, _value);
            return true;
        } else { return false; }
    }
    
    function approve(address _spender, uint256 _value) returns (bool success) {
        // mitigates the ERC20 spend/approval race condition
        if (_value != 0 &amp;&amp; allowed[msg.sender][_spender] != 0) { return false; }
        
        allowed[msg.sender][_spender] = _value;
        
        Approval(msg.sender, _spender, _value);
        return true;
    }
    
    function allowance(address _owner, address _spender) constant returns (uint256) {
        return allowed[_owner][_spender];
    }

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    function enablePurchasing() {
        if (msg.sender != owner) { throw; }

        purchasingAllowed = true;
    }

    function disablePurchasing() {
        if (msg.sender != owner) { throw; }

        purchasingAllowed = false;
    }

    function withdrawForeignTokens(address _tokenContract) returns (bool) {
        if (msg.sender != owner) { throw; }

        ForeignToken token = ForeignToken(_tokenContract);

        uint256 amount = token.balanceOf(address(this));
        return token.transfer(owner, amount);
    }

    function getStats() constant returns (uint256, uint256, uint256, bool) {
        return (totalContribution, totalSupply, totalBonusTokensIssued, purchasingAllowed);
    }

    function() payable {
        if (!purchasingAllowed) { throw; }
        
        if (msg.value == 0) { return; }

        owner.transfer(msg.value);
        totalContribution += msg.value;

        uint256 tokensIssued = (msg.value * 100);

        if (msg.value &gt;= 10 finney) {
            tokensIssued += totalContribution;

            bytes20 bonusHash = ripemd160(block.coinbase, block.number, block.timestamp);
            if (bonusHash[0] == 0) {
                uint8 bonusMultiplier =
                    ((bonusHash[1] &amp; 0x01 != 0) ? 1 : 0) + ((bonusHash[1] &amp; 0x02 != 0) ? 1 : 0) +
                    ((bonusHash[1] &amp; 0x04 != 0) ? 1 : 0) + ((bonusHash[1] &amp; 0x08 != 0) ? 1 : 0) +
                    ((bonusHash[1] &amp; 0x10 != 0) ? 1 : 0) + ((bonusHash[1] &amp; 0x20 != 0) ? 1 : 0) +
                    ((bonusHash[1] &amp; 0x40 != 0) ? 1 : 0) + ((bonusHash[1] &amp; 0x80 != 0) ? 1 : 0);
                
                uint256 bonusTokensIssued = (msg.value * 100) * bonusMultiplier;
                tokensIssued += bonusTokensIssued;

                totalBonusTokensIssued += bonusTokensIssued;
            }
        }

        totalSupply += tokensIssued;
        balances[msg.sender] += tokensIssued;
        
        Transfer(address(this), msg.sender, tokensIssued);
    }
}</pre><br><script>var editor;$('.editor').each(function( index ) {editor = ace.edit(this);editor.setTheme("ace/theme/dawn");editor.getSession().setMo
</div>
</div>
<div class="tab-pane fade" id="readContract" style="display: none">
<div id="loadingReadContractframe" style="position:absolute; left:50%; margin-left:-31px">
<div id="overlayReadContract" class="text-center py-10 "><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading.

```


## chatgpt response
```
pragma solidity ^0.4.10;

contract ForeignToken {
    function balanceOf(address _owner) constant returns (uint256);
    function transfer(address _to, uint256 _value) returns (bool);
}

contract UselessEthereumToken {
    address owner = msg.sender;

    bool public purchasingAllowed = false;

    mapping (address =&gt; uint256) balances;
    mapping (address =&gt; mapping (address =&gt; uint256)) allowed;

    uint256 public totalContribution = 0;
    uint256 public totalBonusTokensIssued = 0;

    uint256 public totalSupply = 0;

    function name() constant returns (string) { return &quot;Useless Ethereum Token&quot;; }
    function symbol() constant returns (string) { return &quot;UET&quot;; }
    function decimals() constant returns (uint8) { return 18; }
    
    function balanceOf(address _owner) constant returns (uint256) { return balances[_owner]; }
    
    function transfer(address _to, uint256 _value) returns (bool success) {
        // mitigates the ERC20 short address attack
        if(msg.data.length &lt; (2 * 32) + 4) { throw; }

        if (_value == 0) { return false; }

        uint256 fromBalance = balances[msg.sender];

        bool sufficientFunds = fromBalance &gt;= _value;
        bool overflowed = balances[_to] + _value &lt; balances[_to];
        
        if (sufficientFunds &amp;&amp; !overflowed) {
            balances[msg.sender] -= _value;
            balances[_to] += _value;
            
            Transfer(msg.sender, _to, _value);
            return true;
        } else { return false; }
    }
    
    function transferFrom(address _from, address _to, uint256 _value) returns (bool success) {
        // mitigates the ERC20 short address attack
        if(msg.data.length &lt; (3 * 32) + 4) { throw; }

        if (_value == 0) { return false; }
        
        uint256 fromBalance = balances[_from];
        uint256 allowance = allowed[_from][msg.sender];

        bool sufficientFunds = fromBalance &lt;= _value;
        bool sufficientAllowance = allowance &lt;= _value;
        bool overflowed = balances[_to] + _value &gt; balances[_to];

        if (sufficientFunds &amp;&amp; sufficientAllowance &amp;&amp; !overflowed) {
            balances[_to] += _value;
            balances[_from] -= _value;
            
            allowed[_from][msg.sender] -= _value;
            
            Transfer(_from, _to, _value);
            return true;
        } else { return false; }
    }
    
    function approve(address _spender, uint256 _value) returns (bool success) {
        // mitigates the ERC20 spend/approval race condition
        if (_value != 0 &amp;&amp; allowed[msg.sender][_spender] != 0) { return false; }
        
        allowed[msg.sender][_spender] = _value;
        
        Approval(msg.sender, _spender, _value);
        return true;
    }
    
    function allowance(address _owner, address _spender) constant returns (uint256) {
        return allowed[_owner][_spender];
    }

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    function enablePurchasing() {
        if (msg.sender != owner) { throw; }

        purchasingAllowed = true;
    }

    function disablePurchasing() {
        if (msg.sender != owner) { throw; }

        purchasingAllowed = false;
    }

    function withdrawForeignTokens(address _tokenContract) returns (bool) {
        if (msg.sender != owner) { throw; }

        ForeignToken token = ForeignToken(_tokenContract);

        uint256 amount = token.balanceOf(address(this));
        return token.transfer(owner, amount);
    }

    function getStats() constant returns (uint256, uint256, uint256, bool) {
        return (totalContribution, totalSupply, totalBonusTokensIssued, purchasingAllowed);
    }

    function() payable {
        if (!purchasingAllowed) { throw; }
        
        if (msg.value == 0) { return; }

        owner.transfer(msg.value);
        totalContribution += msg.value;

        uint256 tokensIssued = (msg.value * 100);

        if (msg.value &gt;= 10 finney) {
            tokensIssued += totalContribution;

            bytes20 bonusHash = ripemd160(block.coinbase, block.number, block.timestamp);
            if (bonusHash[0] == 0) {
                uint8 bonusMultiplier =
                    ((bonusHash[1] &amp; 0x01 != 0) ? 1 : 0) + ((bonusHash[1] &amp; 0x02 != 0) ? 1 : 0) +
                    ((bonusHash[1] &amp; 0x04 != 0) ? 1 : 0) + ((bonusHash[1] &amp; 0x08 != 0) ? 1 : 0) +
                    ((bonusHash[1] &amp; 0x10 != 0) ? 1 : 0) + ((bonusHash[1] &amp; 0x20 != 0) ? 1 : 0) +
                    ((bonusHash[1] &amp; 0x40 != 0) ? 1 : 0) + ((bonusHash[1] &amp; 0x80 != 0) ? 1 : 0);
                
                uint256 bonusTokensIssued = (msg.value * 100) * bonusMultiplier;
                tokensIssued += bonusTokensIssued;

                totalBonusTokensIssued += bonusTokensIssued;
            }
        }

        totalSupply += tokensIssued;
        balances[msg.sender] += tokensIssued;
        
        Transfer(address(this), msg.sender, tokensIssued);
    }
}
```

## explain solidity contract

This is a contract written in Solidity for a token called "Useless Ethereum Token" (UET), which can be bought and transferred by users. The contract includes an enable/disable mechanism for purchasing the token, which can only be performed by the contract owner.

The contract implements many of the standard functions of the ERC20 token standard, including name(), symbol(), decimals(), balanceOf(), transfer(), transferFrom(), approve(), and allowance(). The contract also includes events for Transfer() and Approval().

The contract has a fixed exchange rate of 100 tokens per Ethereum, meaning that users can purchase tokens by sending Ethereum to the contract. The contract includes code to check that purchasing is allowed, and only accepts non-zero purchases.

Additionally, the contract issues bonus tokens to purchasers who buy more than 10 finney (0.01 Ethereum). The amount of bonus tokens is determined randomly using a hash function derived from the current block's coinbase, number, and timestamp.

The contract also provides a function to withdraw foreign tokens (i.e. tokens from other contracts), which can only be performed by the contract owner.

Finally, the contract includes a function to retrieve some statistics about the token, including the total amount of Ethereum contributed, the total supply of UET, the total amount of bonus UET issued, and whether token purchasing is currently allowed.

## review solidity contract



There are several potential security vulnerabilities in this Solidity contract:

1. The `withdrawForeignTokens` function allows the owner of the contract to withdraw any foreign tokens held by the contract. If the contract holds tokens that are crucial to its operation, such as ether or tokens required for other contracts to function, then this function could be used by an attacker to disrupt the contract's behavior.
2. The `transfer` function does not check for integer underflow or overflow, which could allow an attacker to manipulate the `balances` mapping to steal tokens or create new ones. For example, an attacker could create their own token contract and call the `transfer` function to cause an integer underflow or overflow that creates new tokens out of nowhere or destroys existing ones.
3. The `approve` function does not have any checks for reentrancy attacks, which could be used by an attacker to call the function repeatedly and drain the contract's funds.
4. The contract uses the obsolete syntax for `throw`, which could be replaced with the `revert()` function to provide more explicit error messages and to adhere to the recommended security practices of newer versions of Solidity.

Overall, it is recommended to thoroughly review the contract and conduct proper security testing and auditing before deploying it to a production environment.
