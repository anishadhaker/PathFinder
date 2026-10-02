#ifndef GRAPH_H
#define GRAPH_H

#include <map>
#include <string>
#include <vector>

// Configurable default highway distance for the Agra <-> Kota connection (in km).
// Edit this value to configure the distance in the C++ implementation:
const int DEFAULT_AGRA_KOTA_DISTANCE_KM = 380;

struct Road {
    std::string destination;
    int distanceKm;
};

class Graph {
private:
    std::map<std::string, std::vector<Road>> adjacencyList;
    bool locationExists(const std::string& location) const;

public:
    Graph();

    bool hasLocation(const std::string& location) const;
    void addLocation(const std::string& location);
    void addRoad(const std::string& source, const std::string& destination, int distanceKm);
    void setRoadDistance(const std::string& source, const std::string& destination, int distanceKm);
    void displayLocations() const;
    void displayRoads() const;
    void loadSampleCityNetwork(int agraKotaDistanceKm = DEFAULT_AGRA_KOTA_DISTANCE_KM);
    bool findShortestPath(const std::string& source,
                          const std::string& destination,
                          int& shortestDistance,
                          std::vector<std::string>& path) const;
};

#endif
