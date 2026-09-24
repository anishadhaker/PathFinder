#include "Graph.h"

#include <iostream>
#include <string>
#include <vector>

void printPath(const std::vector<std::string>& path) {
    if (path.empty()) {
        std::cout << "No path available.";
        return;
    }

    for (size_t i = 0; i < path.size(); ++i) {
        if (i > 0) {
            std::cout << " -> ";
        }
        std::cout << path[i];
    }
}

int main() {
    Graph cityNetwork;
    cityNetwork.loadSampleCityNetwork();

    std::cout << "===============================================" << std::endl;
    std::cout << "       SHORTEST PATH NAVIGATION SYSTEM" << std::endl;
    std::cout << "===============================================" << std::endl;

    while (true) {
        std::cout << "\nMain Menu" << std::endl;
        std::cout << "1. Find shortest route" << std::endl;
        std::cout << "0. Exit" << std::endl;
        std::cout << "Select an option: ";

        std::string choice;
        std::getline(std::cin, choice);

        if (choice == "0") {
            std::cout << "\nThank you for using the navigation system.\n";
            break;
        }

        if (choice != "1") {
            std::cout << "\nInvalid option. Please enter 1 or 0.\n";
            continue;
        }

        std::cout << "\nAvailable locations:" << std::endl;
        cityNetwork.displayLocations();

        std::string source;
        std::string destination;

        std::cout << "\nEnter source city: ";
        std::getline(std::cin, source);

        std::cout << "Enter destination city: ";
        std::getline(std::cin, destination);

        if (source.empty() || destination.empty()) {
            std::cout << "\nInput is required for both source and destination.\n";
            continue;
        }

        if (!cityNetwork.hasLocation(source)) {
            std::cout << "\nInvalid source city: '" << source << "'.\n";
            continue;
        }

        if (!cityNetwork.hasLocation(destination)) {
            std::cout << "\nInvalid destination city: '" << destination << "'.\n";
            continue;
        }

        if (source == destination) {
            std::cout << "\nSource and destination are the same location.\n";
            std::cout << "Shortest distance: 0 km\n";
            std::cout << "Actual path: " << source << std::endl;
            continue;
        }

        int shortestDistance = -1;
        std::vector<std::string> path;

        if (!cityNetwork.findShortestPath(source, destination, shortestDistance, path)) {
            std::cout << "\nNo route available between " << source << " and " << destination << ".\n";
            continue;
        }

        std::cout << "\nShortest distance from " << source << " to " << destination << " is "
                  << shortestDistance << " km.\n";
        std::cout << "Actual shortest path: ";
        printPath(path);
        std::cout << std::endl;
    }

    return 0;
}
