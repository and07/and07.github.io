function RedBlack()
{
	this.init();
}

RedBlack.prototype.constructor = RedBlack;

RedBlack.prototype.init = function()
{
	this.nextIndex = 1;
	this.commands = [];
	this.pTree = [];
}

RedBlack.prototype.reset = function()
{
	this.nextIndex = 1;
	this.treeRoot = null;
}

RedBlack.WIDTH_DELTA  = 50;
RedBlack.HEIGHT_DELTA = 50;
RedBlack.STARTING_Y = 50;

RedBlack.prototype.isAllDigits = function(str)
{
	for (var i = str.length - 1; i >= 0; i--)
	{
		if (str.charAt(i) < "0" || str.charAt(i) > "9")
		{
			return false;
		}
	}
	return true;
}

RedBlack.prototype.normalizeNumber = function(input, maxLen)
{
	if (!this.isAllDigits(input) || input == "")
	{
		return input;
	}
	else
	{
		return ("OOO0000" +input).substr(-maxLen, maxLen);
	}
}	 
		
RedBlack.prototype.printTree = function(unused)
{
	this.pTree = [];
	
	if (this.treeRoot != null)
	{
		this.highlightID = this.nextIndex++;
		var firstLabel = this.nextIndex;

		this.printTreeRec(this.treeRoot);

		this.nextIndex = this.highlightID;  /// Reuse objects.  Not necessary.
	}
	return this.pTree;
}

RedBlack.prototype.printTreeRec = function(tree) 
{

	if (tree.left != null && !tree.left.phantomLeaf)
	{
        this.printTreeRec(tree.left);
	}
	var nextLabelID = this.nextIndex++;
	this.pTree.push(tree.data);

	if (tree.right != null && !tree.right.phantomLeaf)
	{
		this.printTreeRec(tree.right);
	}
	return;
}


RedBlack.prototype.findElement = function(findValue)
{
	this.commands = [];
    
	this.highlightID = this.nextIndex++;
	
	return this.doFind(this.treeRoot, this.normalizeNumber(findValue,4));	
	
	//return this.commands;
}


RedBlack.prototype.doFind = function(tree, value)
{

	if (tree != null && !tree.phantomLeaf)
	{

		if (tree.data == value)
		{
			return tree.data;
		}
		else
		{
			if (tree.data > value)
			{
				 return this.doFind(tree.left, value);
			}
			else
			{
				 return this.doFind(tree.right, value);						
			}
			
		}
		
	}
	else
	{
        return null;
	}
}

RedBlack.prototype.findUncle = function(tree)
{
	if (tree.parent == null)
	{
		return null;
	}
	var par  = tree.parent;
	if (par.parent == null)
	{
		return null;
	}
	var grandPar   = par.parent;
	
	if (grandPar.left == par)
	{
		return grandPar.right;
	}
	else
	{
		return grandPar.left;
	}				
}



RedBlack.prototype.blackLevel = function(tree)
{
	if (tree == null)
	{
		return 1;
	}
	else
	{
		return tree.blackLevel;
	}
}


RedBlack.prototype.attachLeftNullLeaf = function(node)
{
	// Add phantom left leaf
	var treeNodeID = this.nextIndex++;
	node.left = new RedBlackNode("", treeNodeID, this.startingX, RedBlack.STARTING_Y);
	node.left.phantomLeaf = true;
	node.left.blackLevel = 1;

}	

RedBlack.prototype.attachRightNullLeaf = function(node)
{
	// Add phantom right leaf
	treeNodeID = this.nextIndex++;

	node.right = new RedBlackNode("", treeNodeID, this.startingX, RedBlack.STARTING_Y);
	
	node.right.phantomLeaf = true;
	node.right.blackLevel = 1;
	
}
RedBlack.prototype.attachNullLeaves = function(node)
{
	this.attachLeftNullLeaf(node);
	this.attachRightNullLeaf(node);
}

RedBlack.prototype.insertElement = function(insertedValue)
{
	this.commands = new Array();	

	this.highlightID = this.nextIndex++;
	var treeNodeID;
	if (this.treeRoot == null)
	{
		treeNodeID = this.nextIndex++;

		this.treeRoot = new RedBlackNode(this.normalizeNumber(insertedValue,4), treeNodeID, this.startingX, RedBlack.STARTING_Y);
		this.treeRoot.blackLevel = 1;
		
		this.attachNullLeaves(this.treeRoot);
		this.resizeTree();
		
	}
	else
	{
		treeNodeID = this.nextIndex++;
					
		var insertElem = new RedBlackNode(this.normalizeNumber(insertedValue,4), treeNodeID, 100, 100)
		
		insertElem.height = 1;
		this.insert(insertElem, this.treeRoot);
		//				resizeTree();				
	}
			
	return this.commands;
}


RedBlack.prototype.singleRotateRight = function(tree)
{
	var B = tree;
	var t3 = B.right;
	var A = tree.left;
	var t1 = A.left;
	var t2 = A.right;
	
	
	// TODO:  Change link color
	
	if (t2 != null)
	{
		t2.parent = B;
	}
	
	A.parent = B.parent;
	if (this.treeRoot == B)
	{
		this.treeRoot = A;
	}
	else
	{

		if (B.isLeftChild())
		{
			B.parent.left = A;
		}
		else
		{
			B.parent.right = A;
		}
	}
	A.right = B;
	B.parent = A;
	B.left = t2;
	this.resetHeight(B);
	this.resetHeight(A);
	this.resizeTree();			
	return A;
}



RedBlack.prototype.singleRotateLeft = function(tree) 
{
	var A = tree;
	var B = tree.right;
	var t1 = A.left;
	var t2 = B.left;
	var t3 = B.right;
	
	
	if (t2 != null)
	{
		t2.parent = A;
	}

	B.parent = A.parent;
	if (this.treeRoot == A)
	{
		this.treeRoot = B;
	}
	else
	{
		
		if (A.isLeftChild())
		{
			A.parent.left = B;
		}
		else
		{
			A.parent.right = B;
		}
	}
	B.left = A;
	A.parent = B;
	A.right = t2;
	this.resetHeight(A);
	this.resetHeight(B);
	
	this.resizeTree();
	return B;
}




RedBlack.prototype.getHeight = function(tree) 
{
	if (tree == null)
	{
		return 0;
	}
	return tree.height;
}

RedBlack.prototype.resetHeight = function(tree)
{
	if (tree != null)
	{
		var newHeight = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;
		if (tree.height != newHeight)
		{
			tree.height = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1
		}
	}
}

RedBlack.prototype.insert = function(elem, tree)
{
	if (elem.data < tree.data)
	{
		if (tree.left == null || tree.left.phantomLeaf)
		{
			tree.left=elem;
			elem.parent = tree;
	
			this.attachNullLeaves(elem);
			this.resizeTree();
			
			
			this.resizeTree();
			
			this.fixDoubleRed(elem);
			
		}
		else
		{
			this.insert(elem, tree.left);
		}
	}
	else
	{
		if (tree.right == null  || tree.right.phantomLeaf)
		{
			tree.right=elem;
			elem.parent = tree;

			elem.x = tree.x + RedBlack.WIDTH_DELTA/2;
			elem.y = tree.y + RedBlack.HEIGHT_DELTA
			
			
			this.attachNullLeaves(elem);
			this.resizeTree();
			
			
			this.resizeTree();
			this.fixDoubleRed(elem);
		}
		else
		{
			this.insert(elem, tree.right);
		}
	}
	
	
}


RedBlack.prototype.fixDoubleRed = function(tree)
{
	if (tree.parent != null)
	{
		if (tree.parent.blackLevel > 0)
		{
			return;
		}
		if (tree.parent.parent == null)
		{
			tree.parent.blackLevel = 1;
			return;
		}
		var uncle = this.findUncle(tree);
		if (this.blackLevel(uncle) == 0)
		{

			uncle.blackLevel = 1;
			
			tree.parent.blackLevel = 1;
			
			tree.parent.parent.blackLevel = 0;

			this.fixDoubleRed(tree.parent.parent);
		}
		else
		{
			if (tree.isLeftChild() &&  !tree.parent.isLeftChild())
			{
				
				this.singleRotateRight(tree.parent);
				tree=tree.right;
				
			}
			else if (!tree.isLeftChild() && tree.parent.isLeftChild())
			{
				
				this.singleRotateLeft(tree.parent);
				tree=tree.left;
			}
			
			if (tree.isLeftChild())
			{
				
				this.singleRotateRight(tree.parent.parent);
				tree.parent.blackLevel = 1;

				tree.parent.right.blackLevel = 0;					
				
			}
			else
			{
				
				this.singleRotateLeft(tree.parent.parent);
				tree.parent.blackLevel = 1;
				
				tree.parent.left.blackLevel = 0;			
				
			}					
		}
		
	}
	else
	{
		if (tree.blackLevel == 0)
		{	
			tree.blackLevel = 1;

		}
	}
	
}

RedBlack.prototype.deleteElement = function(deletedValue)
{
	this.commands = new Array();

	this.highlightID = this.nextIndex++;
	this.treeDelete(this.treeRoot, this.normalizeNumber(deletedValue,4));
		
	// Do delete
	return this.commands;						
}


RedBlack.prototype.fixLeftNull = function(tree)
{
	var treeNodeID = this.nextIndex++;
	var nullLeaf;

	nullLeaf = new RedBlackNode("NULL\nLEAF", treeNodeID, tree.x, tree.x);
	nullLeaf.blackLevel = 2;
	nullLeaf.parent = tree;
	nullLeaf.phantomLeaf = true;
	tree.left = nullLeaf;
	
	this.resizeTree();				
	this.fixExtraBlackChild(tree, true);

	nullLeaf.blackLevel = 1;
	this.fixNodeColor(nullLeaf);
}


RedBlack.prototype.fixRightNull = function(tree)
{
	var treeNodeID = this.nextIndex++;
	var nullLeaf;

	nullLeaf = new RedBlackNode("NULL\nLEAF", treeNodeID, tree.x, tree.x);
	nullLeaf.parent = tree;
	nullLeaf.phantomLeaf = true;
	nullLeaf.blackLevel = 2;
	tree.right = nullLeaf;
	
	this.resizeTree();				
	
	this.fixExtraBlackChild(tree, false);
	
	nullLeaf.blackLevel = 1;
	this.fixNodeColor(nullLeaf);
	
}


RedBlack.prototype.fixExtraBlackChild = function(parNode, isLeftChild)
{
	var sibling;
	var doubleBlackNode;
	if (isLeftChild)
	{
		sibling = parNode.right;
		doubleBlackNode = parNode.left;
	}
	else
	{
		sibling = parNode.left;				
		doubleBlackNode = parNode.right;
	}
	if (this.blackLevel(sibling) > 0 && this.blackLevel(sibling.left) > 0 && this.blackLevel(sibling.right) > 0)
	{
		sibling.blackLevel = 0;
		this.fixNodeColor(sibling);
		if (doubleBlackNode != null)
		{
			doubleBlackNode.blackLevel = 1;
			this.fixNodeColor(doubleBlackNode);
			
		}
		if (parNode.blackLevel == 0)
		{
			parNode.blackLevel = 1;
			this.fixNodeColor(parNode);
		}
		else
		{
			parNode.blackLevel = 2;
			this.fixNodeColor(parNode);

			this.fixExtraBlack(parNode);
		}				
	}
	else if (this.blackLevel(sibling) == 0)
	{

		if (isLeftChild)
		{
			var newPar = this.singleRotateLeft(parNode);
			newPar.blackLevel = 1;
			this.fixNodeColor(newPar);
			newPar.left.blackLevel = 0;
			this.fixNodeColor(newPar.left);

			this.fixExtraBlack(newPar.left.left);
			
		}
		else
		{
			newPar  = this.singleRotateRight(parNode);
			newPar.blackLevel = 1;
			this.fixNodeColor(newPar);
			newPar.right.blackLevel = 0;
			this.fixNodeColor(newPar.right);

			this.fixExtraBlack(newPar.right.right);
		}
	}
	else if (isLeftChild && this.blackLevel(sibling.right) > 0)
	{
		
		var newSib = this.singleRotateRight(sibling);
		newSib.blackLevel = 1;
		this.fixNodeColor(newSib);
		newSib.right.blackLevel = 0;
		this.fixNodeColor(newSib.right);
		this.fixExtraBlackChild(parNode, isLeftChild);
	}
	else if (!isLeftChild && this.blackLevel(sibling.left) > 0)
	{

		newSib = this.singleRotateLeft(sibling);
		newSib.blackLevel = 1;
		this.fixNodeColor(newSib);
		newSib.left.blackLevel = 0;
		this.fixNodeColor(newSib.left);

		this.fixExtraBlackChild(parNode, isLeftChild);
	}
	else if (isLeftChild)
	{
		
		var oldParBlackLevel  = parNode.blackLevel;
		newPar = this.singleRotateLeft(parNode);
		if (oldParBlackLevel == 0)
		{
			newPar.blackLevel = 0;
			this.fixNodeColor(newPar);
			newPar.left.blackLevel = 1;
			this.fixNodeColor(newPar.left);
		}
		newPar.right.blackLevel = 1;
		this.fixNodeColor(newPar.right);
		if (newPar.left.left != null)
		{
			newPar.left.left.blackLevel = 1;
			this.fixNodeColor(newPar.left.left);
		}
	}
	else
	{
		
		oldParBlackLevel  = parNode.blackLevel;
		newPar = this.singleRotateRight(parNode);
		if (oldParBlackLevel == 0)
		{
			newPar.blackLevel = 0;
			this.fixNodeColor(newPar);
			newPar.right.blackLevel = 1;
			this.fixNodeColor(newPar.right);
		}
		newPar.left.blackLevel = 1;
		this.fixNodeColor(newPar.left);
		if (newPar.right.right != null)
		{
			newPar.right.right.blackLevel = 1;
			this.fixNodeColor(newPar.right.right);
		}
	}
}


RedBlack.prototype.fixExtraBlack = function(tree)
{
	if (tree.blackLevel > 1)
	{
		if (tree.parent == null)
		{	
			tree.blackLevel = 1;
		}
		else if (tree.parent.left == tree)
		{
			this.fixExtraBlackChild(tree.parent, true);
		}
		else
		{
			this.fixExtraBlackChild(tree.parent, false);					
		}
		
	}
	else 
	{
		// No extra blackness
	}
}



RedBlack.prototype.treeDelete = function(tree, valueToDelete)
{
	var leftchild = false;
	if (tree != null && !tree.phantomLeaf)
	{
		if (tree.parent != null)
		{
			leftchild = tree.parent.left == tree;
		}
		
		if (valueToDelete == tree.data)
		{
			var needFix = tree.blackLevel > 0;
			if (((tree.left == null) || tree.left.phantomLeaf)  && ((tree.right == null) || tree.right.phantomLeaf))
			{
				
				if (leftchild && tree.parent != null)
				{
					tree.parent.left = null;
					this.resizeTree();				
					
					if (needFix)
					{
						this.fixLeftNull(tree.parent);
					}
					else
					{
						
						this.attachLeftNullLeaf(tree.parent);
						this.resizeTree();
					}
				}
				else if (tree.parent != null)
				{
					tree.parent.right = null;
					this.resizeTree();		
					if (needFix)
					{
						this.fixRightNull(tree.parent);
					}
					else
					{
						this.attachRightNullLeaf(tree.parent);
						this.resizeTree();
					}
				}
				else
				{
					this.treeRoot = null;
				}
				
			}
			else if (tree.left == null || tree.left.phantomLeaf)
			{								
				if (tree.left != null)
				{
					tree.left = null;
				}
				
				if (tree.parent != null)
				{
					if (leftchild)
					{
						tree.parent.left = tree.right;
						if (needFix)
						{
							tree.parent.left.blackLevel++;
							this.fixNodeColor(tree.parent.left);
							this.fixExtraBlack(tree.parent.left);
						}
					}
					else
					{
						tree.parent.right = tree.right;
						if (needFix)
						{
							tree.parent.right.blackLevel++;
							this.fixNodeColor(tree.parent.right);
							this.fixExtraBlack(tree.parent.right);
						}
						
					}
					tree.right.parent = tree.parent;
				}
				else
				{
					this.treeRoot = tree.right;
					this.treeRoot.parent = null;
					if (this.treeRoot.blackLevel == 0)
					{
						this.treeRoot.blackLevel = 1;
	
					}
				}
				this.resizeTree();
			}
			else if (tree.right == null || tree.right.phantomLeaf)
			{
				if (tree.right != null)
				{
					tree.right = null;					
				}
				if (tree.parent != null)
				{
					if (leftchild)
					{
						tree.parent.left = tree.left;
						if (needFix)
						{
							tree.parent.left.blackLevel++;
							this.fixNodeColor(tree.parent.left);
							this.fixExtraBlack(tree.parent.left);
							this.resizeTree();
						}
						else
						{								
							this.resizeTree();
								
						}
					}
					else
					{
						tree.parent.right = tree.left;
						if (needFix)
						{
							tree.parent.right.blackLevel++;
							this.fixNodeColor(tree.parent.right);
							this.fixExtraBlack(tree.parent.left);
							this.resizeTree();
						}
						else
						{								
							this.resizeTree();								
						}
					}
					tree.left.parent = tree.parent;
				}
				else
				{
					this.treeRoot = tree.left;
					this.treeRoot.parent = null;
					if (this.treeRoot.blackLevel == 0)
					{
						this.treeRoot.blackLevel = 1;
						this.fixNodeColor(this.treeRoot);
					}
				}
			}
			else // tree.left != null && tree.right != null
			{								
				
				this.highlightID = this.nextIndex;
				this.nextIndex += 1;

				var tmp = tree;
				tmp = tree.left;
																								
				while (tmp.right != null && !tmp.right.phantomLeaf)
				{
					tmp = tmp.right;
																								
				}
				if (tmp.right != null)
				{

					tmp.right = null;
				}

				var labelID = this.nextIndex;
				this.nextIndex += 1;

				tree.data = tmp.data;
					
				
				needFix = tmp.blackLevel > 0;
				
				
				if (tmp.left == null)
				{
					if (tmp.parent != tree)
					{
						tmp.parent.right = null;
						this.resizeTree();
						if (needFix)
						{
							this.fixRightNull(tmp.parent);
						}
						else
						{
															
						}
					}
					else
					{
						tree.left = null;
						this.resizeTree();
						if (needFix)
						{
							this.fixLeftNull(tmp.parent);
						}
						else
						{
															
						}
					}
				}
				else
				{
					
					if (tmp.parent != tree)
					{
						tmp.parent.right = tmp.left; 
						tmp.left.parent = tmp.parent;
						this.resizeTree();
						
						if (needFix)
						{

							tmp.left.blackLevel++;

							this.fixNodeColor(tmp.left);
							this.fixExtraBlack(tmp.left);

							
						}
						else
						{
								
						}
					}
					else
					{
						tree.left = tmp.left;
						tmp.left.parent = tree;
						this.resizeTree();
						if (needFix)
						{

							tmp.left.blackLevel++;

							
							this.fixNodeColor(tmp.left);
							this.fixExtraBlack(tmp.left);

							
						}
						else
						{
								
						}
					}
				}
				tmp = tmp.parent;
				
			}
		}
		else if (valueToDelete < tree.data)
		{
			return this.treeDelete(tree.left, valueToDelete);
		}
		else
		{

			return this.treeDelete(tree.right, valueToDelete);					
		}
	}
	else
	{

	}
	
}

RedBlack.prototype.resizeTree = function()
{
	var startingPoint  = this.startingX;
	this.resizeWidths(this.treeRoot);
	if (this.treeRoot != null)
	{
		if (this.treeRoot.leftWidth > startingPoint)
		{
			startingPoint = this.treeRoot.leftWidth;
		}
		else if (this.treeRoot.rightWidth > startingPoint)
		{
			startingPoint = Math.max(this.treeRoot.leftWidth, 2 * startingPoint - this.treeRoot.rightWidth);
		}
		this.setNewPositions(this.treeRoot, startingPoint, RedBlack.STARTING_Y, 0);
		this.animateNewPositions(this.treeRoot);
	}
	
}

RedBlack.prototype.setNewPositions = function(tree, xPosition, yPosition, side)
{
	if (tree != null)
	{
		tree.y = yPosition;
		if (side == -1)
		{
			xPosition = xPosition - tree.rightWidth;
			tree.heightLabelX = xPosition - 20;
		}
		else if (side == 1)
		{
			xPosition = xPosition + tree.leftWidth;
			tree.heightLabelX = xPosition + 20;
		}
		else
		{
			tree.heightLabelX = xPosition - 20;
		}
		tree.x = xPosition;
		tree.heightLabelY = tree.y - 20;
		this.setNewPositions(tree.left, xPosition, yPosition + RedBlack.HEIGHT_DELTA, -1)
		this.setNewPositions(tree.right, xPosition, yPosition + RedBlack.HEIGHT_DELTA, 1)
	}
	
}
RedBlack.prototype.animateNewPositions = function(tree)
{
	if (tree != null)
	{
		this.animateNewPositions(tree.left);
		this.animateNewPositions(tree.right);
	}
}

RedBlack.prototype.resizeWidths = function(tree) 
{
	if (tree == null)
	{
		return 0;
	}
	tree.leftWidth = Math.max(this.resizeWidths(tree.left), RedBlack.WIDTH_DELTA / 2);
	tree.rightWidth = Math.max(this.resizeWidths(tree.right), RedBlack.WIDTH_DELTA / 2);
	return tree.leftWidth + tree.rightWidth;
}


/////////////////////////////////////////////////////////
// Red black node
////////////////////////////////////////////////////////


function RedBlackNode(val, id, initialX, initialY)
{
	this.data = val;
	this.x = initialX;
	this.y = initialY;
	this.blackLevel = 0;
	this.phantomLeaf = false;
	this.graphicID = id;
	this.left = null;
	this.right = null;
	this.parent = null;
	this.height = 0;
	this.leftWidth = 0;
	this.rightWidth = 0;
}

RedBlackNode.prototype.isLeftChild = function()
{
	if (this.parent == null)
	{
		return true;
	}
	return this.parent.left == this;
}



/////////////////////////////////////////////////////////
// Setup stuff
////////////////////////////////////////////////////////


var	RB = new RedBlack();

RB.insertElement(23);
RB.insertElement(34);
RB.insertElement(4);
RB.insertElement(100);
RB.insertElement(3);
RB.insertElement(14);
RB.insertElement(234);
console.log(RB.findElement(4));
console.log(RB.findElement(25));
console.log(RB.findElement(23));
console.log(RB.printTree());
RB.deleteElement(100);
console.log(RB.printTree());