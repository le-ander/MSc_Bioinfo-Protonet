from __future__ import print_function
from __future__ import division

import scipy.sparse as sp
import numpy as np

import pandas as pd
import networkx as nx

import matplotlib.pyplot as plt

K = 30
Kmax = 200
dimen = 2

# Read Biogrid data into pandas dataframe
df = pd.read_table("~/work/example_data.txt", engine="c")

# Create networkx graph from dataframe (single edge)
#G = nx.from_pandas_dataframe(df, 'ID Interactor A', 'ID Interactor B', create_using=nx.Graph())
G = nx.read_edgelist('edgelist.txt',nodetype=int)

# Determine total number of proteins in the network
N = G.number_of_nodes()

# Calculate shortest pathlengths dictionary in the graph up to a threshold using networkx
p = nx.all_pairs_shortest_path_length(G,K)

# Reformat path lengths to sparse matrix (issue with self-interactions!)
dist_df = pd.DataFrame.from_dict(p).replace(0,2)
dist_df = dist_df.fillna(0)-Kmax
dist_df[dist_df == -Kmax] = 0
dist_mat = sp.csr_matrix(dist_df.values)



sum = dist_mat.sum(1)
sumsum = dist_mat.sum()

vdiff = np.ones((dimen,1))
vdiffmax = 1
count = 0

v = []
vnew = []
vdiff = []
Av = []
mv = np.zeros(dimen)
lam = np.zeros(dimen)
xvals = np.zeros((N,dimen))

for i in range(dimen):
	v.append(np.random.randn(N,1))
	vnew.append(np.zeros((N,1)))
	vdiff.append(np.zeros((N,1)))
	Av.append(np.zeros((N,1)))

#########################
v = []
v.append(np.expand_dims(np.loadtxt('random1.txt',dtype=float),1))
v.append(np.expand_dims(np.loadtxt('random2.txt',dtype=float),1))
#########################


# Change threshold here!!
while vdiffmax > 0.001:

	for i in range(dimen):
		mv[i] = np.mean(v[i])
		vnew[i] = -0.5*(dist_mat.dot(v[i]) - mv[i]*sum + (mv[i]*sumsum/N - (np.dot(sum.T,v[i])*(1/N)).item()*np.ones((N,1))))

	vnew[0] /= np.linalg.norm(vnew[0],2)

	for i in range(1,dimen):
		pom = np.zeros(vnew[i].shape)

		for j in range(i):
			pom += np.dot(np.dot(vnew[j],vnew[i].T),vnew[j])

		vnew[i] -= pom
		vnew[i] /= np.linalg.norm(vnew[i],2)

	count += 1

	for i in range(dimen):
		vdiff[i] = np.linalg.norm(v[i] - vnew[i],2)

	vdiffmax = max(vdiff)
	#print(vdiffmax)

	for i in range(dimen):
		v[i] = vnew[i]


for i in range(dimen):
	mv[i] = np.mean(v[i])

	Av[i] = -0.5*(dist_mat.dot(v[i]) - mv[i]*sum + (mv[i]*sumsum/N - (np.dot(sum.T,v[i])*(1/N)).item()*np.ones((N,1))))
	lam[i] = np.dot(v[i].T,Av[i])

	xvals[:,i] = np.squeeze(np.sqrt(lam[i]) * v[i])
	xvals[i] -= xvals[i].min()
	xvals[i] /= xvals[i].max()

print(xvals)