#ifndef GRAPH_H
#define GRAPH_H

#include <map>
#include <string>
#include <vector>

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
    void displayLocations() const;
    void displayRoads() const;
    void loadSampleCityNetwork();
    bool findShortestPath(const std::string& source,
                          const std::string& destination,
                          int& shortestDistance,
                          std::vector<std::string>& path) const;
};

#endif
