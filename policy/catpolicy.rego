package catalog_policy

import future.keywords.in

default deny := false

deny{
  input.permission.name == "catalog.entity.delete"
  "group:default/testers" in input.identity.groups
}

deny{
  input.permission.name == "catalog.entity.delete"
  input.identity.username == "user:default/dave"
}