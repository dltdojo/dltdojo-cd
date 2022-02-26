package play

import future.keywords.in
#
# [opa - How to check if given string is contained in tags - Stack Overflow](https://stackoverflow.com/questions/68719071/how-to-check-if-given-string-is-contained-in-tags)
#
inputx = {
    "resource": {
        "aws_vpc": {
            "_type": "AWS.EC2.Vpc",
            "cidr_block": "10.0.0.0/16",
            "id": "vpc-abc123",
            "tags": {
                "Application": "Test",
                "MyApplication": "Test2",
                "Name": "my-vpc"
            }
        }
    }
}

vals := {val |
  some key
  val := inputx.resource.aws_vpc.tags[key]
  contains(key, "Application") 
}

set_groups := {"Application", "MyXX"}

check {
  some key
  # contains(key, "Application")
  # key == "Application"
  # check if key belongs to the set
  key in set_groups
  # set_groups[key]
  inputx.resource.aws_vpc.tags[key]
}
