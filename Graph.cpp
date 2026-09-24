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

void Graph::loadSampleCityNetwork() {
    addLocation("Delhi");
    addLocation("Gurgaon");
    addLocation("Noida");
    addLocation("Faridabad");
    addLocation("Ghaziabad");
    addLocation("Rohini");
    addLocation("Dwarka");
    addLocation("Saket");
    addLocation("Karol Bagh");
    addLocation("Lajpat Nagar");

    addRoad("Delhi", "Gurgaon", 32);
    addRoad("Delhi", "Noida", 25);
    addRoad("Delhi", "Rohini", 12);
    addRoad("Delhi", "Karol Bagh", 9);

    addRoad("Gurgaon", "Faridabad", 25);

    addRoad("Noida", "Ghaziabad", 15);
    addRoad("Noida", "Lajpat Nagar", 22);

    addRoad("Faridabad", "Ghaziabad", 30);
    addRoad("Faridabad", "Saket", 26);

    addRoad("Ghaziabad", "Rohini", 21);

    addRoad("Rohini", "Dwarka", 18);
    addRoad("Rohini", "Karol Bagh", 11);

    addRoad("Dwarka", "Saket", 14);

    addRoad("Saket", "Lajpat Nagar", 7);

    addRoad("Karol Bagh", "Lajpat Nagar", 9);
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
