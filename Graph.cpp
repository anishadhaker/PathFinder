#include "Graph.h"

#include <algorithm>
#include <iostream>
#include <queue>
#include <set>
#include <utility>

Graph::Graph() {}

bool Graph::locationExists(const std::string& location) const {
    return adjacencyList.find(location) != adjacencyList.end();
}

bool Graph::hasLocation(const std::string& location) const {
    return locationExists(location);
}

void Graph::addLocation(const std::string& location) {
    if (locationExists(location)) {
        return;
    }

    adjacencyList[location] = {};
}

void Graph::addRoad(const std::string& source, const std::string& destination, int distanceKm) {
    if (distanceKm <= 0) {
        std::cout << "Road distance must be greater than 0 km.\n";
        return;
    }

    if (!locationExists(source)) {
        addLocation(source);
    }

    if (!locationExists(destination)) {
        addLocation(destination);
    }

    adjacencyList[source].push_back({destination, distanceKm});
    adjacencyList[destination].push_back({source, distanceKm});
}

void Graph::setRoadDistance(const std::string& source, const std::string& destination, int distanceKm) {
    if (distanceKm <= 0) {
        std::cout << "Road distance must be greater than 0 km.\n";
        return;
    }

    if (!locationExists(source)) {
        addLocation(source);
    }

    if (!locationExists(destination)) {
        addLocation(destination);
    }

    // Update forward edge or add if not present
    bool forwardFound = false;
    for (auto& road : adjacencyList[source]) {
        if (road.destination == destination) {
            road.distanceKm = distanceKm;
            forwardFound = true;
            break;
        }
    }
    if (!forwardFound) {
        adjacencyList[source].push_back({destination, distanceKm});
    }

    // Update reverse edge or add if not present (bidirectional)
    bool reverseFound = false;
    for (auto& road : adjacencyList[destination]) {
        if (road.destination == source) {
            road.distanceKm = distanceKm;
            reverseFound = true;
            break;
        }
    }
    if (!reverseFound) {
        adjacencyList[destination].push_back({source, distanceKm});
    }
}

void Graph::displayLocations() const {
    std::cout << "\nLocations in the city network:\n";

    if (adjacencyList.empty()) {
        std::cout << "No locations available.\n";
        return;
    }

    for (const auto& entry : adjacencyList) {
        std::cout << " - " << entry.first << "\n";
    }
}

void Graph::displayRoads() const {
    std::cout << "\nRoad connections:\n";

    if (adjacencyList.empty()) {
        std::cout << "No roads available.\n";
        return;
    }

    std::set<std::pair<std::string, std::string>> printedRoads;

    for (const auto& entry : adjacencyList) {
        const std::string& currentLocation = entry.first;

        for (const Road& road : entry.second) {
            std::string first = currentLocation;
            std::string second = road.destination;

            if (first > second) {
                std::swap(first, second);
            }

            std::pair<std::string, std::string> roadKey = {first, second};

            if (printedRoads.insert(roadKey).second) {
                std::cout << " - " << first << " <-> " << second
                          << " : " << road.distanceKm << " km\n";
            }
        }
    }
}

void Graph::loadSampleCityNetwork(int agraKotaDistanceKm,
                                  int agraJaipurDistanceKm,
                                  int ajmerKotaDistanceKm) {
    // 10 Academic Regional City Network Nodes
    addLocation("Delhi");
    addLocation("Jaipur");
    addLocation("Ajmer");
    addLocation("Kota");
    addLocation("Udaipur");
    addLocation("Jodhpur");
    addLocation("Bikaner");
    addLocation("Agra");
    addLocation("Chandigarh");
    addLocation("Amritsar");

    // 16 Bidirectional Weighted Highway Corridors (Distances in km)
    // Existing base connections (weights unchanged):
    addRoad("Delhi", "Jaipur", 280);
    addRoad("Delhi", "Agra", 230);
    addRoad("Delhi", "Chandigarh", 245);
    addRoad("Delhi", "Bikaner", 450);
    addRoad("Jaipur", "Ajmer", 135);
    addRoad("Jaipur", "Kota", 250);
    addRoad("Jaipur", "Jodhpur", 330);
    addRoad("Ajmer", "Udaipur", 260);
    addRoad("Ajmer", "Jodhpur", 210);
    addRoad("Kota", "Udaipur", 290);
    addRoad("Jodhpur", "Udaipur", 250);
    addRoad("Jodhpur", "Bikaner", 250);
    addRoad("Chandigarh", "Amritsar", 225);

    // Bidirectional road connection between Agra and Kota with configurable distance
    addRoad("Agra", "Kota", agraKotaDistanceKm);

    // Additional connections between geographically nearby neighboring cities:
    // Agra <-> Jaipur (NH-21 Golden Triangle Highway corridor, ~240 km):
    addRoad("Agra", "Jaipur", agraJaipurDistanceKm);

    // Ajmer <-> Kota (NH-148D Hadoti-Aravalli expressway, ~205 km):
    addRoad("Ajmer", "Kota", ajmerKotaDistanceKm);
}

bool Graph::findShortestPath(const std::string& source,
                            const std::string& destination,
                            int& shortestDistance,
                            std::vector<std::string>& path) const {
    if (!locationExists(source) || !locationExists(destination)) {
        shortestDistance = -1;
        path.clear();
        return false;
    }

    if (source == destination) {
        shortestDistance = 0;
        path = {source};
        return true;
    }

    const int INF = 1000000000;
    std::map<std::string, int> distances;
    std::map<std::string, std::string> previous;

    for (const auto& entry : adjacencyList) {
        distances[entry.first] = INF;
    }

    distances[source] = 0;

    std::priority_queue<std::pair<int, std::string>,
                        std::vector<std::pair<int, std::string>>,
                        std::greater<std::pair<int, std::string>>>
        minHeap;

    minHeap.push({0, source});

    while (!minHeap.empty()) {
        std::pair<int, std::string> current = minHeap.top();
        minHeap.pop();

        const std::string& currentLocation = current.second;
        int currentDistance = current.first;

        if (currentDistance > distances[currentLocation]) {
            continue;
        }

        for (const Road& road : adjacencyList.at(currentLocation)) {
            int newDistance = currentDistance + road.distanceKm;

            if (newDistance < distances[road.destination]) {
                distances[road.destination] = newDistance;
                previous[road.destination] = currentLocation;
                minHeap.push({newDistance, road.destination});
            }
        }
    }

    if (distances[destination] == INF) {
        shortestDistance = -1;
        path.clear();
        return false;
    }

    shortestDistance = distances[destination];
    path.clear();

    std::string current = destination;
    while (current != source) {
        path.push_back(current);

        auto previousIt = previous.find(current);
        if (previousIt == previous.end()) {
            path.clear();
            shortestDistance = -1;
            return false;
        }

        current = previousIt->second;
    }

    path.push_back(source);
    std::reverse(path.begin(), path.end());
    return true;
}
