function AVL()
{
	this.init();
}

AVL.prototype.constructor = AVL;


AVL.WIDTH_DELTA  = 50;
AVL.HEIGHT_DELTA = 50;
AVL.STARTING_Y = 50;


AVL.prototype.init = function(am, w, h)
{
	this.nextIndex = 1;
	this.commands = [];
}

AVL.prototype.reset = function()
{
	this.nextIndex = 1;
	this.treeRoot = null;
}

AVL.prototype.isAllDigits = function(str)
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

AVL.prototype.normalizeNumber = function(input, maxLen)
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

AVL.prototype.sizeChanged = function(newWidth, newHeight)
{
	this.startingX = newWidth / 2;
}

		 
		
AVL.prototype.printTree = function(unused)
{
	this.commands = [];
	
	if (this.treeRoot != null)
	{
		this.highlightID = this.nextIndex++;
		var firstLabel = this.nextIndex;
		this.printTreeRec(this.treeRoot);
		this.nextIndex = this.highlightID;  /// Reuse objects.  Not necessary.
	}
	return this.commands;
}

AVL.prototype.printTreeRec = function(tree) 
{
	if (tree.left != null)
	{
		this.printTreeRec(tree.left);
	}
	var nextLabelID = this.nextIndex++;
	this.commands.push(tree.data);
	if (tree.right != null)
	{
		this.printTreeRec(tree.right);
	}
	return;
}


AVL.prototype.findElement = function(findValue)
{
	this.commands = [];
	
	this.highlightID = this.nextIndex++;
	
	return this.doFind(this.treeRoot, this.normalizeNumber(findValue, 4));
	
	
	//return this.commands;
}


AVL.prototype.doFind = function(tree, value)
{
	if (tree != null)
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

AVL.prototype.insertElement = function(insertedValue)
{
	this.commands = [];	
	
	if (this.treeRoot == null)
	{
		var treeNodeID = this.nextIndex++;
		var labelID  = this.nextIndex++;				
		this.treeRoot = new AVLNode(this.normalizeNumber(insertedValue, 4), treeNodeID, labelID, this.startingX, AVL.STARTING_Y);
		this.treeRoot.height = 1;
	}
	else
	{
		treeNodeID = this.nextIndex++;
		labelID = this.nextIndex++;
		this.highlightID = this.nextIndex++;
			
		var insertElem = new AVLNode(this.normalizeNumber(insertedValue, 4), treeNodeID, labelID, 100, 100)
		
		insertElem.height = 1;
		this.insert(insertElem, this.treeRoot);
		//this.resizeTree();				
	}
			
	return this.commands;
}


AVL.prototype.singleRotateRight = function(tree)
{
	var B = tree;
	var t3 = B.right;
	var A = tree.left;
	var t1 = A.left;
	var t2 = A.right;
	
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
	this. resetHeight(B);
	this. resetHeight(A);
	this.resizeTree();			
}



AVL.prototype.singleRotateLeft = function(tree)
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
	this. resetHeight(A);
	this. resetHeight(B);
	
	this.resizeTree();			
}




AVL.prototype.getHeight = function(tree) 
{
	if (tree == null)
	{
		return 0;
	}
	return tree.height;
}

AVL.prototype.resetHeight = function(tree)
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

AVL.prototype.doubleRotateRight = function(tree)
{
	var A = tree.left;
	var B = tree.left.right;
	var C = tree;
	var t1 = A.left;
	var t2 = B.left;
	var t3 = B.right;
	var t4 = C.right;
	
	if (t2 != null)
	{
		t2.parent = A;
		A.right = t2;
	}
	if (t3 != null)
	{
		t3.parent = C;
		C.left = t2;
	}
	if (C.parent == null)
	{
		B.parent = null;
		this.treeRoot = B;
	}
	else
	{
		if (C.isLeftChild())
		{
			C.parent.left = B
		}
		else
		{
			C.parent.right = B;
		}
		B.parent = C.parent;
		C.parent = B;
	}

	B.left = A;
	A.parent = B;
	B.right=C;
	C.parent=B;
	A.right=t2;
	C.left = t3;
	this. resetHeight(A);
	this. resetHeight(C);
	this. resetHeight(B);
	
	this.resizeTree();
	
	
}

AVL.prototype.doubleRotateLeft = function(tree)
{
	this.cmd("SetText", 0, "Double Rotate Left");
	var A = tree;
	var B = tree.right.left;
	var C = tree.right;
	var t1 = A.left;
	var t2 = B.left;
	var t3 = B.right;
	var t4 = C.right;
	
	if (t2 != null)
	{
		t2.parent = A;
		A.right = t2;
	}
	if (t3 != null)
	{
		t3.parent = C;
		C.left = t2;
	}
		
	
	if (A.parent == null)
	{
		B.parent = null;
		this.treeRoot = B;
	}
	else
	{
		if (A.isLeftChild())
		{
			A.parent.left = B
		}
		else
		{
			A.parent.right = B;
		}
		B.parent = A.parent;
		A.parent = B;
	}

	B.left = A;
	A.parent = B;
	B.right=C;
	C.parent=B;
	A.right=t2;
	C.left = t3;
	this. resetHeight(A);
	this. resetHeight(C);
	this. resetHeight(B);
	
	this.resizeTree();
	
	
}

AVL.prototype.insert = function(elem, tree)
{

	if (elem.data < tree.data)
	{
		if (tree.left == null)
		{
			tree.left=elem;
			elem.parent = tree;
			
			this.resizeTree();
			
			if (tree.height < tree.left.height + 1)
			{
				tree.height = tree.left.height + 1					
			}
		}
		else
		{
			this.insert(elem, tree.left);
			
			if (tree.height < tree.left.height + 1)
			{
				tree.height = tree.left.height + 1;	
			}
			if ((tree.right != null && tree.left.height > tree.right.height + 1) ||
				(tree.right == null && tree.left.height > 1))
			{
				if (elem.data < tree.left.data)
				{
					this.singleRotateRight(tree);
				}
				else
				{
					this.doubleRotateRight(tree);
				}
			}
		}
	}
	else
	{
		if (tree.right == null)
		{

			tree.right=elem;
			elem.parent = tree;
			elem.x = tree.x + AVL.WIDTH_DELTA/2;
			elem.y = tree.y + AVL.HEIGHT_DELTA
			
			this.resizeTree();
			
			if (tree.height < tree.right.height + 1)
			{
				tree.height = tree.right.height + 1;					
			}
			
		}
		else
		{
			this.insert(elem, tree.right);
			if (tree.height < tree.right.height + 1)
			{
				tree.height = tree.right.height + 1;
			}
			if ((tree.left != null && tree.right.height > tree.left.height + 1) ||
				(tree.left == null && tree.right.height > 1))
			{
				if (elem.data >= tree.right.data)
				{
					this.singleRotateLeft(tree);
				}
				else
				{
					this.doubleRotateLeft(tree);
				}
			}
		}
	}
	
	
}

AVL.prototype.deleteElement = function(deletedValue)
{
	this.commands = [];
	this.highlightID = this.nextIndex++;
	this.treeDelete(this.treeRoot, this.normalizeNumber(deletedValue, 4));
	return this.commands;						
}

AVL.prototype.treeDelete = function(tree, valueToDelete)
{
	var leftchild = false;
	if (tree != null)
	{
		if (tree.parent != null)
		{
			leftchild = tree.parent.left == tree;
		}
		
		if (valueToDelete == tree.data)
		{
			if (tree.left == null && tree.right == null)
			{
				if (leftchild && tree.parent != null)
				{
					tree.parent.left = null;
				}
				else if (tree.parent != null)
				{
					tree.parent.right = null;
				}
				else
				{
					this.treeRoot = null;
				}
				this.resizeTree();
				
			}
			else if (tree.left == null)
			{								
				if (tree.parent != null)
				{
					if (leftchild)
					{
						tree.parent.left = tree.right;
					}
					else
					{
						tree.parent.right = tree.right;
					}
					tree.right.parent = tree.parent;
				}
				else
				{
					this.treeRoot = tree.right;
					this.treeRoot.parent = null;
				}
				this.resizeTree();				
			}
			else if (tree.right == null)
			{								
				if (tree.parent != null)
				{

					if (leftchild)
					{
						tree.parent.left = tree.left;								
					}
					else
					{
						tree.parent.right = tree.left;
					}
					tree.left.parent = tree.parent;
				}
				else
				{
					this.treeRoot = tree.left;
					this.treeRoot.parent = null;
				}
				this.resizeTree();
			}
			else // tree.left != null && tree.right != null
			{								
				
				this.highlightID = this.nextIndex;
				this.nextIndex += 1;

				var tmp = tree;
				tmp = tree.left;
																								
				while (tmp.right != null)
				{
					tmp = tmp.right;																									
				}
				var labelID = this.nextIndex;
				this.nextIndex += 1;
				tree.data = tmp.data;							
				
				if (tmp.left == null)
				{
					if (tmp.parent != tree)
					{
						tmp.parent.right = null;
					}
					else
					{
						tree.left = null;
					}
					this.resizeTree();
				}
				else
				{
					if (tmp.parent != tree)
					{
						tmp.parent.right = tmp.left;
						tmp.left.parent = tmp.parent;
					}
					else
					{
						tree.left = tmp.left;
						tmp.left.parent = tree;
					}
					this.resizeTree();
				}
				tmp = tmp.parent;
				
				if (this.getHeight(tmp) != Math.max(this.getHeight(tmp.left), this.getHeight(tmp.right)) + 1)
				{
					tmp.height = Math.max(this.getHeight(tmp.left), this.getHeight(tmp.right)) + 1;					
				}
				
				
				
				while (tmp != tree)
				{
					var tmpPar = tmp.parent;
					// TODO:  Add extra animation here?
					if (this.getHeight(tmp.left)- this.getHeight(tmp.right) > 1)
					{
						if (this.getHeight(tmp.left.right) > this.getHeight(tmp.left.left))
						{
							this.doubleRotateRight(tmp);
						}
						else
						{
							this.singleRotateRight(tmp);
						}
					}
					if (tmpPar.right != null)
					{
                        if (this.getHeight(tmpPar) != Math.max(this.getHeight(tmpPar.left), this.getHeight(tmpPar.right)) + 1)
                        {
                            tmpPar.height = Math.max(this.getHeight(tmpPar.left), this.getHeight(tmpPar.right)) + 1;					
                        }

					}
					tmp = tmpPar;
				}
				if (this.getHeight(tree.right)- this.getHeight(tree.left) > 1)
				{
					if (this.getHeight(tree.right.left) > this.getHeight(tree.right.right))
					{
						this.doubleRotateLeft(tree);
					}
					else
					{
						this.singleRotateLeft(tree);
					}					
				}
				
			}
		}
		else if (valueToDelete < tree.data)
		{

			this.treeDelete(tree.left, valueToDelete);

			if (this.getHeight(tree.right)- this.getHeight(tree.left) > 1)
			{
				if (this.getHeight(tree.right.left) > this.getHeight(tree.right.right))
				{
					this.doubleRotateLeft(tree);
				}
				else
				{
					this.singleRotateLeft(tree);
				}					
			}
			if (this.getHeight(tree) != Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1)
			{
				tree.height = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;					
			}
		}
		else
		{
			this.treeDelete(tree.right, valueToDelete);

			if (this.getHeight(tree.left)- this.getHeight(tree.right) > 1)
			{
				if (this.getHeight(tree.left.right) > this.getHeight(tree.left.left))
				{
					this.doubleRotateRight(tree);
				}
				else
				{
					this.singleRotateRight(tree);
				}					
			}
			if (this.getHeight(tree) != Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1)
			{
				tree.height = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;					
			}
			
			
		}
	}
	else
	{
		return null;
	}
	
}

AVL.prototype.resizeTree = function()
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
		this.setNewPositions(this.treeRoot, startingPoint, AVL.STARTING_Y, 0);
		this.animateNewPositions(this.treeRoot);
	}
	
}

AVL.prototype.setNewPositions = function(tree, xPosition, yPosition, side)
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
		this.setNewPositions(tree.left, xPosition, yPosition + AVL.HEIGHT_DELTA, -1)
		this.setNewPositions(tree.right, xPosition, yPosition + AVL.HEIGHT_DELTA, 1)
	}
	
}
AVL.prototype.animateNewPositions = function(tree)
{
	if (tree != null)
	{
		this.animateNewPositions(tree.left);
		this.animateNewPositions(tree.right);
	}
}

AVL.prototype.resizeWidths = function(tree) 
{
	if (tree == null)
	{
		return 0;
	}
	tree.leftWidth = Math.max(this.resizeWidths(tree.left), AVL.WIDTH_DELTA / 2);
	tree.rightWidth = Math.max(this.resizeWidths(tree.right), AVL.WIDTH_DELTA / 2);
	return tree.leftWidth + tree.rightWidth;
}

		
function AVLNode(val, id, hid, initialX, initialY)
{
	this.data = val;
	this.x = initialX;
	this.y = initialY;
	this.heightLabelID= hid;
	this.height = 1;
	
	this.graphicID = id;
	this.left = null;
	this.right = null;
	this.parent = null;
}
		
AVLNode.prototype.isLeftChild = function()		
{
	if (this. parent == null)
	{
		return true;
	}
	return this.parent.left == this;	
}




var	AVL = new AVL();

AVL.insertElement(23);
AVL.insertElement(34);
AVL.insertElement(4);
AVL.insertElement(100);
AVL.insertElement(3);
AVL.insertElement(14);
AVL.insertElement(234);
console.log(AVL.findElement(4));
console.log(AVL.findElement(25));
console.log(AVL.findElement(23));
console.log(AVL.printTree());
AVL.deleteElement(100);
console.log(AVL.printTree());