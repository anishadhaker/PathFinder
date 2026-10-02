#ifndef GRAPH_H
#define GRAPH_H

#include <map>
#include <string>
#include <vector>

// Configurable default highway distances for sample city network (in km).
// Edit these values to configure the distances in the C++ implementation:
const int DEFAULT_AGRA_KOTA_DISTANCE_KM = 380;
const int DEFAULT_AGRA_JAIPUR_DISTANCE_KM = 240;
const int DEFAULT_AJMER_KOTA_DISTANCE_KM = 205;

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
    void loadSampleCityNetwork(int agraKotaDistanceKm = DEFAULT_AGRA_KOTA_DISTANCE_KM,
                               int agraJaipurDistanceKm = DEFAULT_AGRA_JAIPUR_DISTANCE_KM,
                               int ajmerKotaDistanceKm = DEFAULT_AJMER_KOTA_DISTANCE_KM);
    bool findShortestPath(const std::string& source,
                          const std::string& destination,
                          int& shortestDistance,
                          std::vector<std::string>& path) const;
};

#endif
