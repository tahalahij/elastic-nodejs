### elastic App backend 


This app is responsible to keep elastic search updated with rabbitMq queue
----
Create a file testbench file in src `src/testbench.js`, and put the following:
```
import config from 'config';

(async () => {
 
  console.log('it works);
})();
```

Then run:  
`npm run testbench`
## how to setup elastic on ubuntu:
update etc/elastic/elasticsearch.yaml :

`uncomment node.name`

`uncomment and change : network.host : 0.0.0.0`

`uncomment discovery.seed_hosts an change to ["127.0.0.1"]`

`uncomment  cluster.initil_master-node and change to only ["node-1"]`


`curl XGET 127.0.0.1:9200     // check if installed`

## how to setup RabbitMQ on an ubuntu:
approach 1:
 installing link: 
`https://computingforgeeks.com/how-to-install-latest-rabbitmq-server-on-ubuntu-linux/`

erlang is a requirement : 
	`https://computingforgeeks.com/how-to-install-latest-erlang-on-ubuntu-linux/`

the management panel: 
`http://localhost:15672/`

approach 2:
if docker :
`docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management`

##it's recommended to install Mysql Workbench Community
