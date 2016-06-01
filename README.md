#**Name That Landmark**

#About

Name That Landmark is a game built with the [ArcGIS API for JavaScript](https://developers.arcgis.com/javascript/). The aim of the game is to guess a location from aerial imagery by scratching off a panel obscuring it. The more that is scratched the less a player scores. A player also scores less points the longer they take to name the location.

This fork contains 2 branches:
 - master - slightly modified layout for use at Esri UK Annual Conference 2016 on touch screen, with black overview map
 - scoreboard - purely shows the scoreboard, designed to be run on a secondary display. Does not auto-refresh (used a third-party browser extension to do this)

#Sample
The sample is build with a world landmark dataset and can be viewed [here](http://apps.esriuk.com/app/ScratchMapGame/4/view/11cc7e9fb5ba456295ef9db727d83647/index.html#).

#Configuring
Editing the config.json file allows you to specify:
- Polygon feature service containing location content for the game
- Editable point feature service for leaderboard data (must have 'Name' and 'Score' fields)
- Field in the polygon feature service that contains the location name
- Object ID field in the polygon feature service
- Amount of time allowed for each round
- Number of rounds

#Issues

Find a bug or want to request a new feature? Please let us know by submitting an issue.

#Licensing

Copyright 2016 ESRI (UK) Limited

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the Licence.
